# Optional: LLM answers for "Ask my CV"

GitHub Pages can't keep secrets, so an API key in the website's JavaScript would be visible to
anyone. This small Cloudflare Worker sits in between: the website sends it the question and the
retrieved passages, and the Worker calls the LLM with your key.

What the Worker does:
1. **Critique**: the LLM marks which passages are relevant (shown as "Kept" / "Filtered by critique").
2. **Answer**: it writes a short answer from those passages only, citing them as [1], [2], ...

## Deploy (about 10 minutes)

You need a free Cloudflare account, Node.js, and an API key from an LLM provider.

```bash
cd worker
npx wrangler login                 # opens the browser once
# edit wrangler.toml: set PROVIDER, API_BASE and MODEL
npx wrangler secret put API_KEY    # paste your key when asked
npx wrangler deploy
```

`deploy` prints a URL like `https://ask-mukul.<your-subdomain>.workers.dev`.
Paste it into `content.js`:

```js
ai: {
  endpoint: "https://ask-mukul.<your-subdomain>.workers.dev",
  ...
}
```

Commit, and the search panel will show LLM answers.

## Providers

| PROVIDER | API_BASE | Notes |
|---|---|---|
| `openai` | `https://api.openai.com/v1` | Also works for any OpenAI-compatible API: change `API_BASE` (e.g. Groq, Mistral, OpenRouter) |
| `anthropic` | not used | Claude API, e.g. `MODEL = "claude-haiku-4-5-20251001"` |

Pick a small, cheap model: answers are short (max 500 tokens) and grounded in the passages.

## Keep costs safe

- **Set a monthly spending limit** in your LLM provider's dashboard. This is the most important step.
- `ALLOWED_ORIGINS` stops other websites from using your Worker from a browser.
- Questions are capped at 300 characters and 6 passages, and the first page load never calls the LLM.
- Optional: add a rate-limiting rule for the Worker in the Cloudflare dashboard.

## Test locally

Add `http://localhost:8000` to `ALLOWED_ORIGINS`, then:

```bash
npx wrangler dev     # Worker on http://localhost:8787
```
and set `endpoint: "http://localhost:8787"` in `content.js` while testing.
