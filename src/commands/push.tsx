import { command, flag, numericOption, stringArg, stringOption } from "console-commando";
import { makeConsoleManager } from "../helpers/console";
import { filterByMtime, lsRecursive, ListResult } from "../helpers/filesystem";
import Bottleneck from "bottleneck";
import path from "path";
import chalk from "chalk";
import { parseBucketAndPrefix } from "../helpers/s3";
import { Timers } from "../helpers/timers";
import { formatSize } from "../helpers/format";
import { format } from "prettier";

export const PushCmd = command("push")
  .withArgument(stringArg("local", "Local rooot directory to push", undefined, true))
  .withArgument(stringArg("remote", "Bucket and path", undefined, true))
  .withOption(flag("verbose", "v", "Show more output."))
  .withOption(flag("dry-run", "n", "Do not upload files."))
  .withOption(numericOption("concurrency", "c", "Maximum concurrent requests."))
  .withOption(stringOption("since", "s", "Only push files that changed on or after this timestamp."))

  .withHandler(async (cmd, state) => {
    const local = cmd.getStringArg("local") as string;
    const remote = cmd.getStringArg("remote") as string;
    const since = cmd.getStringOption("since");
    const concurrency = cmd.getNumericOption("concurrency") || 10;
    const verbose = cmd.getFlag("verbose");
    const dryrun = cmd.getFlag("dry-run");

    const notBefore = since ? new Date(since).getTime() : undefined;

    // Initialize helpers.
    const s3 = state.get("s3");
    const c = await makeConsoleManager();

    const { bucket, prefix } = parseBucketAndPrefix(remote);
    const rootDir = path.relative(".", local);

    c.setTask([`Getting list of files to push...`], true);
    const initTimer = Timers.startTimer();
    const files = await lsRecursive(rootDir).then((files) =>
      // Optionally filter by mtime
      notBefore ? filterByMtime(files, notBefore) : files,
    );
    const totalSize = files.reduce((p, c) => p + c.stat.size, 0);
    c.log(
      `Pushing ${files.length} files (${formatSize(totalSize)}) from ${local} to ${remote} ${concurrency} concurrent ${
        since ? `since ${since}` : ""
      }`,
    );
    let accSize = 0;
    const uploadTimer = Timers.startTimer();
    const fileListTimer = initTimer.stop();
    if (verbose) {
      c.ok(`Fetched file list in ${fileListTimer.ms}ms (total ${formatSize(totalSize)})`);
    }

    let nDone = 0;
    const limiter = new Bottleneck({
      // TODO: parameter
      maxConcurrent: concurrency,
    });
    const putFile = limiter.wrap(async ({ file, stat }: ListResult, i: number) => {
      // Remove  root directory and slash from key.
      const key = `${prefix}${file.slice(rootDir.length + 1)}`;
      const thisFileTimer = Timers.startTimer();
      await s3.putFile(bucket, key, file);

      accSize += stat.size;
      nDone++;
      const speed = nDone / uploadTimer.seconds;
      const speedBytes = accSize / uploadTimer.seconds;
      if (verbose) {
        c.info(
          `[${i} / ${files.length}] Uploading ${chalk.green(file)} to ${chalk.yellow(
            `s3://${bucket}${key}`,
          )} (${formatSize(stat.size)}) in ${chalk.green(thisFileTimer.ms)}ms`,
        );
      }
      const percent = Math.round((i * 100) / files.length);
      const percentBytes = Math.round((accSize * 100) / totalSize);
      c.setTask(
        [
          `${nDone}/${files.length} files (${formatSize(accSize)} / ${formatSize(totalSize)}) ${initTimer.human}`,
          `${speed.toFixed(0)}/s (${percent}%) - ${formatSize(speedBytes)}/s (${percentBytes}%)`,
        ],
        true,
      );
    });

    try {
      if (!dryrun) {
        await Promise.all(files.map(putFile));
      } else {
        c.log(`Skipping uploading of ${files.length} files for dry-run.`);
      }
    } catch (err) {
      c.clearTask();
      c.error(err.message);
      process.exit(1);
    }

    const totalTimer = initTimer.stop();
    const totalUploadTimer = uploadTimer.stop();

    c.ok(`Done pushing ${files.length} files from ${local} to ${remote}${since ? ` since ${since}` : ""}\n`);
    c.log(`  Total time:   ${chalk.green(totalTimer.human)}`);
    c.log(`  List time:    ${chalk.green(uploadTimer.human)}`);
    c.log(`  Upload time:  ${chalk.green(fileListTimer.human)}`);
    c.log(`  Upload speed: ${chalk.green(totalUploadTimer.getSpeed(nDone))} files/second`);
    c.clearTask();
  });
