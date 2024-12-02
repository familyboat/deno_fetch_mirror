import { basename, join } from "@std/path";
import { which } from "@david/which";
import { $ } from "@david/dax";
import { parseArgs } from "@std/cli";

export function getName(
  downloadUrl: string,
): { archiveName: string; denoName: string } {
  const pathname = new URL(downloadUrl).pathname;
  const archiveName = basename(pathname);

  return { archiveName, denoName: "deno" };
}

/**
 * @param downloadUrl
 */
async function upgrade(downloadUrl: string): Promise<void> {
  const { archiveName, denoName } = getName(downloadUrl);
  const mirror = `https://fake-url.deno.dev?url=${downloadUrl}`;

  const response = await fetch(mirror);
  const tmpDir = await Deno.makeTempDir();
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

  await Deno.remove(tmpDir, {
    recursive: true,
  });
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
