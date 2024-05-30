# HSM-Agents-Hub

![Preview](https://github.com/ArtemUpnode/HSM-Agents-Hub/blob/main/preview.png)

HSM Agents Hub is a collection of smart agents with the ability to connect different HSMs (YubiHSM, Ledger, etc) to manage the device and sign messages and transactions.

## Download

You can download the latest version of the application on MacOS (for M Series Silicon Chips) in the [releases](https://github.com/ArtemUpnode/HSM-Agents-Hub/releases) section of this repository. Make sure you have [llama3](https://ollama.com/library/llama3) model installed and running.

## Agents

### @YubiHSM

Manages the YubiHSM device and signs messages and transactions.

**Available Functionality:**

1. **Get connected YubiHSM user devices to PC**
    - **Description:** Retrieves a list of YubiHSM devices connected to the PC.
    - **Required Parameters:** None
    - **Example:** \`@YubiHSM My devices\`

2. **Get keys in YubiHSM user device**
    - **Description:** Fetches keys stored in a YubiHSM user device.
    - **Required Parameters:**
      - \`device_serial_id\`: (string) YubiHSM device serial id
      - \`auth_key_id\`: (number) YubiHSM auth key id
      - \`password\`: (string) YubiHSM auth key password
    - **Example:** \`@YubiHSM Get keys in device "123456", auth key 1, password "your_password"\`

3. **Sign a user message with a specific key in YubiHSM user device**
    - **Description:** Signs a given message using a specific key stored in the YubiHSM user device.
    - **Required Parameters:**
      - \`message\`: (string) Message for signing
      - \`device_serial_id\`: (string) YubiHSM device serial id
      - \`auth_key_id\`: (number) YubiHSM auth key id
      - \`password\`: (string) YubiHSM auth key password
      - \`signing_key_id\`: (number) Id of the key that signs the message
    - **Example:** \`@YubiHSM Sign message "Hello World" with device "123456", auth key 1, password "your_password" and key id 2\`

## Under development/In plans

- Extend the functionality of `list_keys` and `sign_message` by adding support for other chains: Cosmos (secpk256k1) and Solana, Aptos, Sui (Ed25519)
- Functions `generateKeys` for YubiHSM. Discussed need for `importKeys`, `exportKeys` functions (may be unsafe)
- Ledger support
- Integration with web3 provider and sending transactions
- Interface/server improvements
- Fixing known bugs

## Challenges Diary

- To interact with YubiHSM devices from the JS side, a wrapper was developed over the yubihsmrs library in Tauri. Function calls also work in Node.js if Neon Bindings are used instead of Tauri.
- To improve function calls, we continue to experiment with different models and prompts. Currently using llama3 and the results are satisfactory. Also OllamaChat in LangChain doesn't support custom tool calling for agents, making it difficult to integrate the above features. See [#9917](https://github.com/langchain-ai/langchain/issues/9917), [#39](https://github.com/ollama/ollama-python/issues/39) and other issues in related repo.
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
