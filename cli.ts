import { Command } from "commander";
import { program } from "./constant.ts";
import { clean } from "./subcommand/clean.ts";
import { upgrade } from "./subcommand/upgrade.ts";

import json from "./deno.json" with { type: "json" };

export const cli = new Command();
cli.name(program)
  .description("Fetch deno from mirror.")
  .version(json.version);

cli.command("clean")
  .description("Clean up the cache")
  .action(clean);

cli.command("upgrade")
  .description("Upgrade deno")
  .argument("<url>", "Url for specified deno version")
  .action(upgrade);
