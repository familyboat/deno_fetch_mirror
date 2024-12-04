import { join } from "@std/path/join";
import { cacheDirPrefix, cacheRootDir } from "../constant.ts";

export async function clean() {
  for await (const dirEntry of Deno.readDir(cacheRootDir)) {
    if (dirEntry.isDirectory && dirEntry.name.startsWith(cacheDirPrefix)) {
      const fullpath = join(cacheRootDir, dirEntry.name);
      console.log(`Clean up ${fullpath}`);
      await Deno.remove(fullpath, {
        recursive: true,
      });
    }
  }
}
