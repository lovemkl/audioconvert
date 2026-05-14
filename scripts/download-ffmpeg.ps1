# ============================================================
# Download pre-built static FFmpeg binaries for Windows x64
# Run once before `tauri dev` or `tauri build`
# Usage: pwsh -ExecutionPolicy Bypass -File scripts\download-ffmpeg.ps1
# ============================================================

$ErrorActionPreference = "Stop"

$BinDir = Join-Path $PSScriptRoot "..\src-tauri\bin"
New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

$FfmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.7z"
$TmpDir    = Join-Path $env:TEMP "ffmpeg_dl_$(Get-Random)"
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

Write-Host "📦  Downloading FFmpeg for Windows x64 …"
$Archive = Join-Path $TmpDir "ffmpeg.7z"
Invoke-WebRequest -Uri $FfmpegUrl -OutFile $Archive -UseBasicParsing

# Extract with 7-Zip (if available) or fallback to tar on Windows 10+
$SevenZip = (Get-Command "7z" -ErrorAction SilentlyContinue)?.Source
if ($SevenZip) {
    & $SevenZip x $Archive -o"$TmpDir" -y | Out-Null
} else {
    # Windows 10 1803+ ships tar that handles .7z via libarchive
    tar -xf $Archive -C $TmpDir
}

$FfmpegExe  = Get-ChildItem -Path $TmpDir -Recurse -Filter "ffmpeg.exe"  | Select-Object -First 1
$FfprobeExe = Get-ChildItem -Path $TmpDir -Recurse -Filter "ffprobe.exe" | Select-Object -First 1

Copy-Item $FfmpegExe.FullName  (Join-Path $BinDir "ffmpeg.exe")
Copy-Item $FfprobeExe.FullName (Join-Path $BinDir "ffprobe.exe")

# Tauri sidecar naming: <name>-<target-triple>.exe
$Triple = (rustc -vV 2>$null | Select-String "host:").ToString().Split(" ")[1]
if (-not $Triple) { $Triple = "x86_64-pc-windows-msvc" }

Copy-Item (Join-Path $BinDir "ffmpeg.exe")  (Join-Path $BinDir "ffmpeg-$Triple.exe")
Copy-Item (Join-Path $BinDir "ffprobe.exe") (Join-Path $BinDir "ffprobe-$Triple.exe")

Remove-Item -Recurse -Force $TmpDir

Write-Host "✅  Windows binaries → $BinDir\ffmpeg-$Triple.exe"
