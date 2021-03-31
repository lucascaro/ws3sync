import { fdir } from "fdir";
import { promises as fs, Stats } from "fs";

export interface ListResult {
  file: string;
  stat: Stats;
}

export async function lsRecursive(dir: string): Promise<ListResult[]> {
  const fileList = (await new fdir()
    .withBasePath()
    // .withDirs()
    .crawl(dir)
    // .filter((_, isDir) => !isDir)
    .withPromise()) as string[];

  return Promise.all(fileList.map(async (file) => ({ file, stat: await fs.stat(file) })));
}

export async function filterByMtime(files: ListResult[], notBefore: number): Promise<ListResult[]> {
  // return files;
  return (
    files
      // We already have stat, so filter by it.
      .filter((r) => r.stat.mtimeMs > notBefore)
  );
}
