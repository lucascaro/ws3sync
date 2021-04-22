import {
  Bucket,
  CreateBucketCommand,
  CreateBucketCommandOutput,
  ListBucketsCommand,
  ListObjectsCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
  S3ClientConfig,
  _Object,
} from "@aws-sdk/client-s3";
import { createReadStream, Stats } from "fs";
import { basename } from "path";
import { Readable } from "stream";

export interface S3Helper {
  createBucket: (bucket: string) => Promise<CreateBucketCommandOutput>;
  listBuckets: () => Promise<Bucket[]>;
  listObjects: (bucket: string, prefix?: string) => Promise<_Object[]>;
  putObject: (bucket: string, key: string, body: Buffer | Readable, size?: number) => Promise<any>;
  putFile: (bucket: string, key: string, path: string, stat: Stats) => Promise<PutObjectCommandOutput>;
}

export const makeS3Helper = (configuration: S3ClientConfig): Readonly<S3Helper> => {
  const client = new S3Client(configuration);
  const state = {};

  const self: S3Helper = {
    createBucket,
    listBuckets,
    listObjects,
    putObject,
    putFile,
  } as const;

  function createBucket(bucket: string): Promise<CreateBucketCommandOutput> {
    return client.send(new CreateBucketCommand({ Bucket: bucket }));
  }
  async function listBuckets(): Promise<Bucket[]> {
    const res = await client.send(new ListBucketsCommand({}));
    return res.Buckets || [];
  }
  async function listObjects(bucket: string, prefix?: string): Promise<_Object[]> {
    const res = await client.send(new ListObjectsCommand({ Bucket: bucket, Prefix: prefix }));
    return res.Contents || [];
  }
  function putObject(
    bucket: string,
    key: string,
    body: Buffer | Readable,
    size?: number,
  ): Promise<PutObjectCommandOutput> {
    return client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentLength: size }));
  }
  function putFile(bucket: string, key: string, path: string, stat?: Stats): Promise<PutObjectCommandOutput> {
    const readable = createReadStream(path);
    return putObject(bucket, key, readable, stat?.size);
  }

  return Object.freeze(self);
};

const REMOTE_RE = /^s3:\/\/(?<bucket>[^/]+)(?<pathPrefix>\/.*)?$/;
export function parseBucketAndPrefix(remote: string): { bucket: string; prefix: string } {
  const match = remote.match(REMOTE_RE);
  if (!match || !match.groups?.["bucket"] || !match.groups?.["pathPrefix"]) {
    throw new Error(`Invalid remote`);
  }
  const { bucket, pathPrefix } = match.groups;
  const prefix = `/${basename(pathPrefix)}/`;

  return { bucket, prefix };
}
