param(
  [string]$Container = 'pt-brain-mongo',
  [string]$Database = 'pt-brain',
  [string]$OutDir = (Join-Path $env:USERPROFILE 'PTBrainBackups'),
  [int]$KeepDays = 30
)

$ErrorActionPreference = 'Stop'

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$archivePath = "/tmp/pt-brain-$stamp.gz"
$localPath = Join-Path $OutDir "pt-brain-$stamp.gz"

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$running = docker inspect --format '{{.State.Running}}' $Container 2>$null
if ($running -ne 'true') {
  throw "Container '$Container' is not running. Start Docker Desktop and the stack first."
}

Write-Host "Dang dump database '$Database' tu container '$Container'..."
docker exec $Container mongodump --db $Database --archive=$archivePath --gzip
if ($LASTEXITCODE -ne 0) {
  throw 'mongodump failed.'
}

docker cp "${Container}:$archivePath" $localPath
if ($LASTEXITCODE -ne 0) {
  throw 'docker cp failed.'
}

docker exec $Container rm -f $archivePath | Out-Null

$hash = (Get-FileHash -Path $localPath -Algorithm SHA256).Hash
"$hash  $(Split-Path $localPath -Leaf)" | Out-File -FilePath "$localPath.sha256" -Encoding ascii

Get-ChildItem -Path $OutDir -Filter 'pt-brain-*.gz' |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$KeepDays) } |
  Remove-Item -Force

$sizeMb = [math]::Round((Get-Item $localPath).Length / 1MB, 2)
Write-Host "Backup xong: $localPath ($sizeMb MB)"
Write-Host "SHA256: $hash"
