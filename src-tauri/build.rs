fn main() {
    // Expose the build target triple at compile time so sidecar paths can be
    // resolved at runtime without knowing the platform details elsewhere.
    let target = std::env::var("TARGET").unwrap_or_default();
    println!("cargo:rustc-env=TARGET_TRIPLE={target}");
    tauri_build::build()
}
