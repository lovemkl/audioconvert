#!/usr/bin/env bash
# ============================================================
# Download pre-built static FFmpeg binaries for macOS / Linux
# Run once before `tauri dev` or `tauri build`
# Usage: bash scripts/download-ffmpeg.sh
# ============================================================
set -euo pipefail

BIN_DIR="$(cd "$(dirname "$0")/.." && pwd)/src-tauri/bin"
mkdir -p "$BIN_DIR"

OS="$(uname -s)"
ARCH="$(uname -m)"

echo "📦  Downloading FFmpeg for $OS / $ARCH …"

if [[ "$OS" == "Darwin" ]]; then
  # macOS — Universal binary (Intel + Apple Silicon)
  FFMPEG_URL="https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip"
  FFPROBE_URL="https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip"

  TMP="$(mktemp -d)"
  curl -L "$FFMPEG_URL"  -o "$TMP/ffmpeg.zip"
  curl -L "$FFPROBE_URL" -o "$TMP/ffprobe.zip"
  unzip -o "$TMP/ffmpeg.zip"  -d "$TMP"
  unzip -o "$TMP/ffprobe.zip" -d "$TMP"

  cp "$TMP/ffmpeg"  "$BIN_DIR/ffmpeg"
  cp "$TMP/ffprobe" "$BIN_DIR/ffprobe"
  rm -rf "$TMP"

  # Tauri sidecar naming: <name>-<target-triple>
  TRIPLE="$(rustc -vV 2>/dev/null | grep 'host:' | awk '{print $2}' || echo 'aarch64-apple-darwin')"
  cp "$BIN_DIR/ffmpeg"  "$BIN_DIR/ffmpeg-${TRIPLE}"
  cp "$BIN_DIR/ffprobe" "$BIN_DIR/ffprobe-${TRIPLE}"

  # Remove quarantine flag so macOS doesn't block execution
  xattr -d com.apple.quarantine "$BIN_DIR/ffmpeg-${TRIPLE}"  2>/dev/null || true
  xattr -d com.apple.quarantine "$BIN_DIR/ffprobe-${TRIPLE}" 2>/dev/null || true
  chmod +x "$BIN_DIR/ffmpeg-${TRIPLE}" "$BIN_DIR/ffprobe-${TRIPLE}"

  echo "✅  macOS binaries → $BIN_DIR/ffmpeg-${TRIPLE}"

elif [[ "$OS" == "Linux" ]]; then
  FFMPEG_URL="https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz"
  TMP="$(mktemp -d)"
  curl -L "$FFMPEG_URL" -o "$TMP/ffmpeg.tar.xz"
  tar -xf "$TMP/ffmpeg.tar.xz" -C "$TMP"
  EXTRACTED="$(find "$TMP" -maxdepth 2 -name 'ffmpeg' -type f | head -1)"
  cp "$EXTRACTED" "$BIN_DIR/ffmpeg"
  cp "$(dirname "$EXTRACTED")/ffprobe" "$BIN_DIR/ffprobe"
  rm -rf "$TMP"

  TRIPLE="$(rustc -vV 2>/dev/null | grep 'host:' | awk '{print $2}' || echo 'x86_64-unknown-linux-gnu')"
  cp "$BIN_DIR/ffmpeg"  "$BIN_DIR/ffmpeg-${TRIPLE}"
  cp "$BIN_DIR/ffprobe" "$BIN_DIR/ffprobe-${TRIPLE}"
  chmod +x "$BIN_DIR/ffmpeg-${TRIPLE}" "$BIN_DIR/ffprobe-${TRIPLE}"

  echo "✅  Linux binaries → $BIN_DIR/ffmpeg-${TRIPLE}"
else
  echo "❌  Unsupported OS: $OS — use scripts/download-ffmpeg.ps1 on Windows"
  exit 1
fi
