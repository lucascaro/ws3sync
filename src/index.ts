import { command, stringOption } from "console-commando";
import { readFileSync } from "fs";
import { join } from "path";
import { PushCmd } from "./commands/push";
import { makeS3Helper } from "./helpers/s3";

const pkg = join(__dirname, "..", "package.json");
const { description, version, bin } = JSON.parse(readFileSync(pkg, "utf-8"));
const cmdName = Object.keys(bin)[0];

command(cmdName)
  .withVersion(version)
  .withDescription(description)
  .withOption(stringOption("endpoint", "E", "S3 Endpoint"))
  .withOption(stringOption("region", "R", "S3 Region"))
  .withPreProcessor((cmd, state) => {
    const s3 = makeS3Helper({
      endpoint: cmd.getStringOption("endpoint"),
      region: cmd.getStringOption("region") || process.env.AWS_DEFAULT_REGION,
      // Credentials from environment variables.
      // AWS_ACCESS_KEY_ID
      // AWS_SECRET_ACCESS_KEY
      forcePathStyle: true,
    });
    return state.set("s3", s3);
  })
  // Sub commands
  .withSubCommand(PushCmd)

  // Run!
  .withRuntimeArgs()
  .run();
