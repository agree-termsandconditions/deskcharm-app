<div align="center">

<img src="src-tauri/icons/128x128@2x.png" width="96" alt="DeskCharm icon" />

# DeskCharm

**A tiny lucky charm that lives on your desktop.**

It hangs from a thread at the top of your screen, sways with a little wind, and reacts when you click it. Pick a charm rooted in a real tradition — or hang your own emoji instead.

</div>

---

## What it is

DeskCharm is a transparent, always-on-top desktop overlay. A single charm hangs on a swinging, physically-simulated thread — drag it, flick it, or just let it sway. Click it to trigger its **ritual** (a small animation + sound), or right-click to open the picker and choose a different charm.

- 🧿 **Nazar Boncuğu** (Turkey & the Levant) — spin it to ward off the evil eye
- 🪬 **Hamsa** (Middle East & North Africa) — flick it away for good fortune
- 🍀 **Four-Leaf Clover** (Ireland) — rub it for luck
- 🐱 **Maneki-neko** (Japan) — tap its paw
- 🪲 **Scarab** (Egypt) — turn it over
- 🐘 **Ganesha** (India) — clear the path
- 福 **Fu** (China) — flip it upside down
- 🌶️🍋 **Nimbu-mirchi** (India) — hang a fresh garland
- 👺 **Drishti bommai** (India) — stare it down
- 🪢 **Pánchángjié** (China) — spin the tassel
- ✨ or type any emoji of your own

The window is click-through everywhere except the charm itself, so it never gets in the way of whatever you're actually doing.

## Tech stack

Built with [Tauri](https://tauri.app/) (Rust) for the desktop shell, [React](https://react.dev/) + TypeScript for the UI, and [Vite](https://vitejs.dev/) for the dev/build tooling. The rope/thread physics are a small custom simulation ([`src/useRope.ts`](src/useRope.ts)).

## Getting started

**Prerequisites:** [Node.js](https://nodejs.org/), [Rust](https://www.rust-lang.org/tools/install), and the [Tauri system dependencies](https://tauri.app/start/prerequisites/) for your OS.

```bash
# install dependencies
npm install

# run in development mode
npm run tauri dev

# build a release bundle
npm run tauri build
```

## Contributing

Convert this Tauri app to an .exe using a simple web converter because Tauri applications require compiling Rust source code alongside web frontend assets.

However, you can build the .exe entirely in the cloud for free without installing anything on your PC by using GitHub Actions.

Step 1: Fork the Repository
Go to https://github.com/shivawwww/deskcharm-app.

Click the Fork button near the top right to copy the repository to your personal GitHub account.

Step 2: Add a Build Workflow
In your forked repository, click Add file > Create new file.

Name the file path:

    .github/workflows/build.yml

Paste the following configuration:

YAML
-----
    
    name: Build Windows EXE
    on:
      workflow_dispatch:
    
    permissions:
      contents: write
    
    jobs:
      build-tauri:
        runs-on: windows-latest
        steps:
          - name: Checkout repository
            uses: actions/checkout@v4
    
          - name: Setup Node.js
            uses: actions/setup-node@v4
            with:
              node-version: 20
    
          - name: Install Rust
            uses: dtolnay/rust-toolchain@stable
    
          - name: Install frontend dependencies
            run: npm install
    
          - name: Build Tauri App
            run: npm run tauri build -- --bundles msi
            env:
              CI: true
    
          - name: Upload EXE and MSI Artifacts
            uses: actions/upload-artifact@v4
            with:
              name: DeskCharm-Windows
              path: |
                src-tauri/target/release/*.exe
                src-tauri/target/release/bundle/msi/*.msi
            
* Click Commit changes... and commit directly to the default branch.

Step 3: Trigger the Build and Download the .exe
-----------------------------------------------------
* Go to the Actions tab in your repository.

* In the left sidebar, click Build Windows EXE.

* Click the Run workflow dropdown on the right and select the green Run workflow button.

* Wait 5–10 minutes for the Windows runner to compile the Rust binary.

* Click on the completed run. Scroll down to the Artifacts section at the bottom to download your packaged .exe or .msi file.


## License

[MIT](LICENSE)
