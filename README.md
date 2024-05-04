# hsm-agents-hub

![Preview](https://github.com/ArtemUpnode/HSM-Agents-Hub/blob/main/preview.png)

HSM Agents Hub is a collection of smart agents with the ability to connect different HSMs (YubiHSM, Ledger, etc) to read and sign messages.

## Download

You can download the latest version of the application on MacOS in the releases section of this repository. Make sure you have [llama3](https://ollama.com/library/llama3) model installed and running.

## Implemented

- YubiHSM smart agent, reading serial numbers of connected devices

## Under development/In plans

- Functions listAsymmetricKeys, createSignature, generateAsymmetricKeys for YubiHSM. Discussed need for importWrappedKeys, exportWrappedKeys functions (may be unsafe).
- Ledger support
- Interface/server improvements
- Fixing known bugs

## Complexities

- OllamaChat in LangChain doesn't support custom tool calling for agents, making it difficult to integrate the above features. See [#9917](https://github.com/langchain-ai/langchain/issues/9917), [#39](https://github.com/ollama/ollama-python/issues/39) and other issues in related repo.
- Since Tauri usually doesn't support NextJS API routes (this is needed for ai.js), we share code and logic between NextJS API routes and a local server used in the Tauri app. To achieve this, the pkg package is used to package up a node server as a binary. This binary is then used as a sidecar in the Tauri app. However, this adds the problem of calling rust functions from the sidecar side. The solution is to spawn a server inside the Tauri app and let sidecar do http requests against that server which in turn calls the Tauri commands.

## Development

Make sure you have Node.js v20, npm, rust installed on your system.

1. Clone and install dependencies

```bash
git clone
pnpm install
```

2. Use [yao-pkg](https://github.com/yao-pkg/pkg-binaries) to pack the server into a single executable file and make it as a sidecar binary for Tauri, before packing you need to check your computer arch by running

```bash
rustc -Vv | grep host | cut -f2 -d' '
```

Then change the word `server-aarch64-apple-darwin` to `server-yours` in packages.json, for example `server-x86_64-apple-darwin` and run

```bash
pnpm install -g @yao-pkg/pkg
pnpm pkg-server
```

3. Build

```bash
pnpm tauri build
```
