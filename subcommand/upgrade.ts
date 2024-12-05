import $ from "@david/dax";
import { which } from "@david/which";
import { join } from "@std/path/join";
import { toTransformStream } from "@std/streams";
import { cacheDirPrefix, cacheRootDir, fakeUrl } from "../constant.ts";
import { getName } from "../util.ts";

import { instantiate } from "../lib/rs_lib.generated.js";

const { get_download_url } = await instantiate();

/**
 * @param version the stable version of deno to upgrade to
 */
export async function upgrade(version: string): Promise<void> {
  const downloadUrl = get_download_url(version);

  let archiveName, denoName;
  try {
    const result = getName(downloadUrl);
    archiveName = result.archiveName;
    denoName = result.denoName;
  } catch {
    console.log(`Argument url is invalid: ${downloadUrl}`);
    return;
  }

  const mirror = `${fakeUrl}${downloadUrl}`;

  const startTime = Date.now();

  const response = await fetch(mirror);
  if (response.status !== 200) {
    console.log(
      `Fetch failed. Status text of the response is ${response.statusText}`,
    );
    return;
  }
  const tmpDir = await Deno.makeTempDir({
    dir: cacheRootDir,
    prefix: cacheDirPrefix,
  });
  const tmpArchive = join(tmpDir, archiveName);
  const tmpDeno = join(tmpDir, denoName);

  const encoder = new TextEncoder();
  const LINE_CLEAR = encoder.encode("\r\u001b[K");

  const HIDE_CURSOR = encoder.encode("\x1b[?25l");
  const SHOW_CURSOR = encoder.encode("\x1b[?25h");

  const totalLength = +(response.headers.get("content-length") || 1);

  const progressStream = response.body?.pipeThrough<Uint8Array>(
    toTransformStream(async function* (src) {
      let readLength = 0;

      await Deno.stdout.write(HIDE_CURSOR);

      for await (const chunk of src) {
        const endTime = Date.now();
        const delta = ((endTime - startTime) / 1000).toFixed(0);

        readLength += chunk.byteLength;
        const percent = (readLength / totalLength * 100).toFixed(2);
        const frame = encoder.encode(
          `Downloading progress is ${percent}%; elapsed time is ${delta} s.`,
        );

        const writeData = new Uint8Array(LINE_CLEAR.length + frame.length);
        writeData.set(LINE_CLEAR);
        writeData.set(frame, LINE_CLEAR.length);
        await Deno.stdout.write(writeData);

        yield chunk;
      }

      console.log("\n");
      Deno.stdout.write(SHOW_CURSOR);
    }),
  );

  await Deno.writeFile(tmpArchive, await new Response(progressStream).bytes());

  const result = await $`unzip ${tmpArchive} -d ${tmpDir}`;

  if (result.code === 0) {
    const pathToDeno = await which("deno");

    if (pathToDeno) {
      // Can't use cp command,
      // because cp command will result in "cp: Text file busy (os error 26)",
      // when destination target is running.
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
