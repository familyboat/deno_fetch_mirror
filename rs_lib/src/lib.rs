use wasm_bindgen::prelude::*;

const RELEASE_URL: &str = "https://github.com/denoland/deno/releases";

static ARCHIVE_NAME: &str = "deno-x86_64-unknown-linux-gnu.zip";

#[wasm_bindgen]
pub fn get_download_url(version: &str) -> String {
  format!("{}/download/v{}/{}", RELEASE_URL, version, ARCHIVE_NAME)
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_get_download_url() {
    assert_eq!(get_download_url("2.0.1").as_str(), "https://github.com/denoland/deno/releases/download/v2.0.1/deno-x86_64-unknown-linux-gnu.zip")
  }
}
