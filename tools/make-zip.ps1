# Zips the contents of a folder with "/" in entry names. Compress-Archive in
# Windows PowerShell 5.1 writes backslashes, which Linux servers unpack as file
# names ("audio\laute\a.wav") instead of folders. Used by build-zip.bat.
param(
  [Parameter(Mandatory)][string]$Source,
  [Parameter(Mandatory)][string]$Destination
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

$src = (Resolve-Path $Source).Path.TrimEnd("\")
$dest = [IO.Path]::GetFullPath((Join-Path (Get-Location) $Destination))
if (Test-Path $dest) { Remove-Item $dest }

$zip = [IO.Compression.ZipFile]::Open($dest, "Create")
try {
  Get-ChildItem $src -Recurse -File | ForEach-Object {
    $name = $_.FullName.Substring($src.Length + 1).Replace("\", "/")
    [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip, $_.FullName, $name, "Optimal")
  }
} finally {
  $zip.Dispose()
}
