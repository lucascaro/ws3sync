import { parseBucketAndPrefix } from "../s3";

describe("parseBucketAndPrefix", () => {
  it("should parse the remote", () => {
    const { bucket, prefix } = parseBucketAndPrefix("s3://bucket-name/prefix/");

    expect(bucket).toBe("bucket-name");
    expect(prefix).toBe("/prefix/");
  });

  it("should parse deeply nested directories", () => {
    const { bucket, prefix } = parseBucketAndPrefix("s3://bucket-name/prefix1/prefix2/prefix3/prefix4");

    expect(bucket).toBe("bucket-name");
    expect(prefix).toBe("/prefix1/prefix2/prefix3/prefix4/");
  });

  it("should throw on invalid input", () => {
    expect(() => parseBucketAndPrefix("bucket-name/prefix")).toThrowError();
    expect(() => parseBucketAndPrefix("s3:bucket-name")).toThrowError();
    expect(() => parseBucketAndPrefix("s3:/bucket-name/prefix")).toThrowError();
    expect(() => parseBucketAndPrefix("s3:/bucket-name")).toThrowError();
  });

  it("should add a trailing slash", () => {
    const { prefix } = parseBucketAndPrefix("s3://bucket-name/prefix");
    expect(prefix).toBe("/prefix/");
  });

  it("should remove extra trailing slashes", () => {
    const { prefix } = parseBucketAndPrefix("s3://bucket-name/prefix///");
    expect(prefix).toBe("/prefix/");
  });
});
