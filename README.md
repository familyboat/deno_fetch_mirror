It can only be supported in linux for now.

## Install

Install it globally with deno:

```sh
deno install -A --global jsr:@familyboat/deno-fetch-mirror
```

## Update

Update deno-fetch-mirror:

```sh
deno install -A --global --reload -f jsr:@familyboat/deno-fetch-mirror
```

## How to use

You can use it to upgrade deno for stable version or clean up cache.

### Upgrade

```sh
deno-fetch-mirror upgrade <version>
```

### CLean

```sh
deno-fetch-mirror clean
```
