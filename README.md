# EasyJobs For TOKA - Job Assistant

## <a href="https://easyjobs.tokadream.com">Live App</a>

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) to get started. This project follows a [Code of Conduct](./CODE_OF_CONDUCT.md) — by participating, you agree to uphold its standards.

### Credits

- <a href="https://github.com/facebook/react">React</a>
- <a href="https://github.com/vercel/next.js">Next</a>
- <a href="https://github.com/shadcn-ui/ui">Shadcn</a>
- <a href="https://github.com/prisma/prisma">Prisma</a>
- <a href="https://github.com/tailwindlabs/tailwindcss">Tailwind</a>
- <a href="https://github.com/ueberdosis/tiptap">Tiptap</a>
- <a href="https://github.com/plouc/nivo">Nivo</a>
- <a href="https://github.com/sqlite/sqlite">Sqlite</a>
- <a href="https://github.com/vercel/ai">Vercel AI-SDK</a>
- <a href="https://github.com/ollama/ollama">Ollama</a>

### Supported AI Model Providers

API keys for all cloud providers can be configured in **Settings > AI Settings** after signing in. Ollama is selected as the default provider.

> **Note:** Selected models must support **structured output** for AI features to work correctly.

<details>
<summary><strong>Ollama (Local)</strong></summary>

Works with [Ollama](https://ollama.com) to run AI models locally on your machine.

- Make sure Ollama is installed and running on the same system
- AI settings will show a list of available models based on what you have downloaded in Ollama
- **Recommended:** Increase the Ollama context length from the default 4k for better results
- No API key required — runs entirely on your hardware

</details>

<details>
<summary><strong>OpenAI</strong></summary>

- Get your API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Add your API key in **Settings > AI Settings**
- Select **OpenAI** as the provider and choose your preferred model
- Available models are fetched dynamically from the OpenAI API

</details>

<details>
<summary><strong>DeepSeek</strong></summary>

- Get your API key at [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)
- Add your API key in **Settings > AI Settings**
- Select **DeepSeek** as the provider and choose your preferred model

</details>

<details>
<summary><strong>Google Gemini</strong></summary>

- Get your API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- Add your API key in **Settings > AI Settings**
- Select **Gemini** as the provider and choose your preferred model

</details>

<details>
<summary><strong>OpenRouter</strong></summary>

Access a wide range of AI models from multiple providers through a single API.

- Get your API key at [openrouter.ai/keys](https://openrouter.ai/keys)
- Add your API key in **Settings > AI Settings**
- Select **OpenRouter** as the provider and choose from available models

</details>

### Note

- If you are updating from an old version and already logged in, please try logging out and login again.

## Support the Project

If JobSync has been helpful in your job search, consider giving it a star on GitHub! It helps others discover the project and motivates continued development.

[![GitHub Stars](https://img.shields.io/github/stars/Gsync/jobsync?style=social)](https://github.com/Gsync/jobsync)

Every star means a lot — thank you for your support!

