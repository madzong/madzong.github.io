#[cfg(target_arch = "wasm32")]
async fn fetch_bytes(url: &str) -> Result<Vec<u8>, wasm_bindgen::JsValue> {
    use wasm_bindgen::JsCast;
    use wasm_bindgen_futures::JsFuture;

    let window = web_sys::window().unwrap();
    let response: web_sys::Response = JsFuture::from(window.fetch_with_str(url))
        .await?
        .dyn_into()?;

    if !response.ok() {
        return Err(format!("{url}: HTTP {}", response.status()).into());
    }

    let buffer = JsFuture::from(response.array_buffer()?).await?;
    Ok(js_sys::Uint8Array::new(&buffer).to_vec())
}

#[cfg(not(target_arch = "wasm32"))]
async fn fetch_bytes(url: &str) -> std::io::Result<Vec<u8>> {
    std::fs::read(url)
}

pub struct Image {
    pub width: u32,
    pub height: u32,
    pub rgba: Vec<u8>,
}

pub async fn load_image(url: &str) -> Option<Image> {
    let bytes = fetch_bytes(url).await.ok()?;
    let img = image::load_from_memory(&bytes).ok()?.to_rgba8();
    let (width, height) = img.dimensions();
    Some(Image { width, height, rgba: img.into_raw() })
}
