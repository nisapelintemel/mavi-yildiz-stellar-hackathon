**Build Instructions (Soroban contract)**

- **Local (Windows PowerShell)**
  - Ensure Rust is installed: https://www.rust-lang.org/tools/install
  - From the contract folder run:
    ```powershell
    .\build-contract.ps1
    # Optional: also install soroban-cli and run soroban build:
    .\build-contract.ps1 -WithSoroban
    ```
  - Built artifact and metadata will be in `stellar-contract\dist\`.

- **Local (Linux / WSL / macOS)**
  - Ensure Rust is installed.
  - From the contract folder run:
    ```bash
    ./build-contract.sh
    ```
  - Built artifact and metadata will be in `stellar-contract/dist/`.

- **CI**
  - GitHub Actions workflow `.github/workflows/contract-build.yml` runs the build and tests on push/PR for the `stellar-contract/` path.

- **What the scripts produce**
  - `dist/contract.wasm` — the compiled WebAssembly module
  - `dist/build-metadata.json` — build metadata (package, sha256, timestamps, tool versions)

If you hit build errors, copy the cargo output and paste it here — I will help diagnose and fix them.
