/**
 * Utils for deno upgrade.
 * Downloading deno from original source is too slow.
 * So download it form mirror.
 *
 * @author familyboat
 */

import { CurrentOS } from "@cross/runtime";
import { cli } from "./cli.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  if (CurrentOS !== "linux") {
    console.log(`deno_fetch_mirror is only supported in linux.`);
    Deno.exit(1);
  }

  cli.parse();
}
