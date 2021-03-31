import Bottleneck from "bottleneck";
import { filterByMtime, lsRecursive } from "./helpers/filesystem";
import { makeS3Helper } from "./helpers/s3";

(async () => {
  try {
    const s3 = makeS3Helper({
      endpoint: "http://127.0.0.1:4566",
      region: "us-west-2",
      credentials: { accessKeyId: "test", secretAccessKey: "test" },
      forcePathStyle: true,
    });

    const buckets = await s3.listBuckets();
    console.log(buckets);
    if (buckets.length === 0) {
      await s3.createBucket("demo-bucket");
    }
    const bucket: string | undefined = buckets[0]?.Name || "demo-bucket";
    console.log(`Using bucket ${bucket}`);
    if (!bucket) {
      console.error("No buckets");
      return;
    }

    return;

    // // console.log(await s3.listObjects(bucket.Name));

    // const notBefore = new Date().getTime() - 100 * 60 * 1000;
    // console.log(`not before ${notBefore}`);
    // const files = await lsRecursive("fixtures").then((files) => filterByMtime(files, notBefore));

    // console.log(files.length);
    // console.log(files.slice(0, 10));

    // // List files
    // // Filter modified after?
    // // bucket by glob?
    // // dependencies, assets with unique names
    // // js, page-data, html
    // // grab buckets, and push to s3 in parallel
    // console.log(`Found ${files.length} files to upload.`);
    // let start = Date.now();
    // let speed = 0;
    // const limiter = new Bottleneck({
    //   maxConcurrent: 2000,
    // });
    // const putFile = limiter.wrap((file: string, i: number) => {
    //   const key = file.replace(/^fixtures\//, "");
    //   console.log(`[${i} / ${speed.toFixed(0)}/s] Uploading ${file} as ${key}`);
    //   return s3
    //     .putFile(bucket, key, file)
    //     .then(() => {
    //       const now = Date.now();
    //       speed = (i / (now - start)) * 1000;
    //     })
    //     .catch((err) => console.error(err));
    // });

    // let i = 0;
    // for (const file of files) {
    //   putFile(file, i);
    //   i++;
    // }
  } catch (err) {
    console.error(err);
  }
})();
