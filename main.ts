import { basename, extname, join } from "@std/path";
import { which } from "@david/which";
import { $ } from "@david/dax";
import { parseArgs } from "@std/cli";

/**
 * 从 downloadUrl 中获取：文件名，可执行文件的名称，文件名的主干部分。
 */
export function getName(
  downloadUrl: string,
): { 
  archiveName: string; 
  denoName: string;
  stem: string;
} {
  const pathname = new URL(downloadUrl).pathname;
  const archiveName = basename(pathname);
  const ext = extname(pathname);
  const stem = basename(pathname, ext);

  return { archiveName, denoName: "deno", stem };
}

const cacheRootDir = '/tmp';
const cacheDirPrefix = 'deno_fetch_mirror';

const fakeUrl = 'https://fake-url.deno.dev?url=';

/**
 * @param downloadUrl
 */
async function upgrade(downloadUrl: string): Promise<void> {
  const { archiveName, denoName, stem } = getName(downloadUrl);
  const mirror = `${fakeUrl}${downloadUrl}`;

  const response = await fetch(mirror);
  const tmpDir = await Deno.makeTempDir({
    dir: cacheRootDir,
    prefix: cacheDirPrefix,
    suffix: stem,
  });
  const tmpArchive = join(tmpDir, archiveName);
  const tmpDeno = join(tmpDir, denoName);
  await Deno.writeFile(tmpArchive, await response.bytes());

  const result = await $`unzip ${tmpArchive} -d ${tmpDir}`;

  if (result.code === 0) {
    const pathToDeno = await which("deno");

    if (pathToDeno) {
      const result = await $`mv ${tmpDeno} ${pathToDeno}`;

      if (result.code === 0) {
        console.log(`Upgrading deno successed!`);
      } else {
        console.log(`mv error: ${result.stderr}`);
      }
    } else {
      console.log(
        `Can not find deno. You should manually deal with downloaded deno, which is at ${tmpDeno}.`,
      );
    }
  } else {
    console.error(`unzip error: ${result.stderr}`);
  }
}

function showHelp() {
  console.log(`Upgrade deno:

usage:

deno_upgrade --url <downloadUrl>
`);
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const args = Deno.args;
  const { url } = parseArgs(args);

  if (url) {
    await upgrade(url);
  } else {
    showHelp();
  }
}
