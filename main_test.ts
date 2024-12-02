import { assertEquals } from "@std/assert";
import { getName } from "./main.ts";

Deno.test(function addTest() {
  const downloadUrl =
    `https://github.com/denoland/deno/releases/download/v2.1.2deno-x86_64-unknown-linux-gnu.zip`;

  const { archiveName, denoName } = getName(downloadUrl);

  assertEquals(archiveName, "v2.1.2deno-x86_64-unknown-linux-gnu.zip");

  assertEquals(denoName, "deno");
});
