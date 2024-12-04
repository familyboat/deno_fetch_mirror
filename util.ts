import { basename } from "@std/path";

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