import { basename, join } from "@std/path";
import { which } from "@david/which";
import { $ } from "@david/dax";
import {CurrentOS} from '@cross/runtime';
import { Command } from 'commander';

/**
 * 从 downloadUrl 中获取：文件名，可执行文件的名称。
 */
export function getName(
  downloadUrl: string,
): { 
  archiveName: string; 
  denoName: string;
} {
  const pathname = new URL(downloadUrl).pathname;
  const archiveName = basename(pathname);

  return { archiveName, denoName: "deno"};
}

const program = 'deno_fetch_mirror';

const cacheRootDir = '/tmp';
const cacheDirPrefix = `${program}_`;

const fakeUrl = 'https://fake-url.deno.dev?url=';

/**
 * @param downloadUrl
 */
async function upgrade(downloadUrl: string): Promise<void> {
  const { archiveName, denoName } = getName(downloadUrl);
  const mirror = `${fakeUrl}${downloadUrl}`;

  const response = await fetch(mirror);
  const tmpDir = await Deno.makeTempDir({
    dir: cacheRootDir,
    prefix: cacheDirPrefix,
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
        console.log(`cp error: ${result.stderr}`);
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

async function clean() {
  for await(const dirEntry of Deno.readDir(cacheRootDir)) {
    if (dirEntry.isDirectory && dirEntry.name.startsWith(cacheDirPrefix)) {
      const fullpath = join(cacheRootDir, dirEntry.name);
      console.log(`Clean up ${fullpath}`);
      await Deno.remove(fullpath, {
        recursive: true
      })
    }
  }
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  if (CurrentOS !== 'linux') {
    console.log(`deno_fetch_mirror is only supported in linux.`);
    Deno.exit(1);
  }

  const cli = new Command();
  cli.name(program)
  .description('Fetch deno from mirror.');

  cli.command('clean')
  .description('Clean up the cache')
  .action(clean)

  cli.command('upgrade')
  .description('Upgrade deno')
  .argument('<url>', 'Url for specified deno version')
  .action(upgrade);

  cli.parse();
}
