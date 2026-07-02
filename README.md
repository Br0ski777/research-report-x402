# Research Report API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://research-report.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Generate research reports by fetching and compiling multiple web sources on a topic. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "research-report": {
      "url": "https://research-report.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://research-report.api.klymax402.com/api/report" \
  -H "Content-Type: application/json" \
  -d '{"topic":"..."}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `research_generate_report` | POST | `/api/report` | $0.02 | Generate a research report on a given topic |

### `research_generate_report`

Use this when you need a comprehensive research report on any topic. Accepts a topic and optional depth parameter. Fetches multiple web sources, extracts key information, and compiles a structured report with summary, key findings, sources, and analysis. Returns markdown-formatted report. Do NOT use for simple web search — use web_search_query instead. Do NOT use for single page scraping — use web_scrape_to_markdown instead. Do NOT use for SEO analysis — use seo_audit_page instead.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `topic` | string | yes | The research topic to investigate |
| `depth` | string | no | Research depth: quick (3 sources), standard (5 sources), deep (8 sources). Default: standard |

## Example agent prompts

- "A comprehensive research report on any topic"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
