<#
build-contract.ps1
Windows PowerShell helper to prepare toolchain, add wasm target and build the Soroban contract.

Usage:
  .\build-contract.ps1            # run the default flow
  .\build-contract.ps1 -WithSoroban # also install soroban-cli and run `soroban contract build` if possible

#> 

param(
    [switch]$WithSoroban
)

function Write-ErrAndExit($msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

Write-Host "Checking Rust toolchain..."
try {
    rustup --version | Out-Null
} catch {
    Write-ErrAndExit "'rustup' not found. Install Rust from https://www.rust-lang.org/tools/install and re-open PowerShell."
}

Write-Host "rustup: $(rustup --version)"
Write-Host "rustc: $(rustc --version)"
Write-Host "cargo: $(cargo --version)"

Write-Host "Ensuring wasm32 target is installed..."
rustup target add wasm32-unknown-unknown | Out-Null

Push-Location -Path $PSScriptRoot
try {
    Write-Host "Building contract (wasm target, release)..."
    cargo build --release --target wasm32-unknown-unknown
    if ($LASTEXITCODE -ne 0) {
        Write-ErrAndExit "cargo build failed. See messages above."
    }

    # Determine package name from Cargo.toml
    $pkg = (Select-String -Path Cargo.toml -Pattern '^name\s*=\s*"(.+)"' | ForEach-Object { $_.Matches[0].Groups[1].Value })
    $wasmPath = Join-Path $PSScriptRoot "target\wasm32-unknown-unknown\release\$($pkg).wasm"

    if (Test-Path $wasmPath) {
        Write-Host "WASM built: $wasmPath" -ForegroundColor Green
    } else {
        Write-ErrAndExit "WASM artifact not found at expected path: $wasmPath"
    }

    # Prepare dist folder
    $distDir = Join-Path $PSScriptRoot "dist"
    if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }
    $outWasm = Join-Path $distDir "contract.wasm"
    Copy-Item -Path $wasmPath -Destination $outWasm -Force

    # Compute sha256
    $hash = Get-FileHash -Path $outWasm -Algorithm SHA256
    $sha256 = $hash.Hash

    # Build metadata
    $meta = [PSCustomObject]@{
        package = $pkg
        wasm = "contract.wasm"
        wasm_sha256 = $sha256
        built_at = (Get-Date).ToString("o")
        rustc = (rustc --version)
        cargo = (cargo --version)
    }
    $meta | ConvertTo-Json | Set-Content -Path (Join-Path $distDir "build-metadata.json") -Encoding UTF8
    Write-Host "WASM and metadata written to: $distDir" -ForegroundColor Green

    if ($WithSoroban) {
        Write-Host "Installing soroban-cli (this may take a few minutes)..."
        cargo install --locked soroban-cli
        if ($LASTEXITCODE -ne 0) {
            Write-ErrAndExit "Failed to install soroban-cli via cargo."
        }

        Write-Host "Running 'soroban contract build' to produce contract artifacts..."
        soroban contract build
        if ($LASTEXITCODE -ne 0) {
            Write-ErrAndExit "soroban contract build failed."
        }
        Write-Host "soroban build completed. Artifacts are under target/" -ForegroundColor Green
    }

} finally {
    Pop-Location
}

Write-Host "Done." -ForegroundColor Cyan
