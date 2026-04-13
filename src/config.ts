import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "research-report",
  slug: "research-report",
  description: "Generate multi-source research reports on any topic. Structured markdown with findings, sources, and analysis.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/report",
      price: "$0.02",
      description: "Generate a research report on a given topic",
      toolName: "research_generate_report",
      toolDescription: `Use this when you need a comprehensive research report compiled from multiple web sources. Returns a structured markdown report with cited findings and analysis.

1. title: generated report title
2. summary: executive summary paragraph (3-5 sentences)
3. keyFindings: array of 5-10 major findings with source attribution
4. sections: structured report sections with headers and content
5. sources: array of all sources used with title, URL, and relevance score
6. methodology: description of sources consulted and depth level
7. generatedAt: timestamp of report generation

Example output: {"title":"State of AI in Healthcare 2026","summary":"AI adoption in healthcare reached...","keyFindings":["Hospital AI spending up 45% YoY","FDA approved 23 new AI diagnostics"],"sections":[{"header":"Market Overview","content":"The global..."}],"sources":[{"title":"WHO Report","url":"https://...","relevance":0.95}],"methodology":"standard (5 sources)"}

Use this FOR deep research on unfamiliar topics, competitive analysis, or market intelligence. Essential when you need cited, multi-source answers rather than single-page scrapes.

Do NOT use for simple web search -- use web_search_query. Do NOT use for single page scraping -- use web_scrape_to_markdown. Do NOT use for fact-checking claims -- use research_check_fact.`,
      inputSchema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "The research topic to investigate" },
          depth: { type: "string", description: "Research depth: quick (3 sources), standard (5 sources), deep (8 sources). Default: standard" },
        },
        required: ["topic"],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "topic": {
              "type": "string",
              "description": "Research topic"
            },
            "depth": {
              "type": "string",
              "description": "Research depth level"
            },
            "sourcesAnalyzed": {
              "type": "number",
              "description": "Number of sources analyzed"
            },
            "report": {
              "type": "string",
              "description": "Generated research report in markdown"
            },
            "sources": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "title": {
                    "type": "string"
                  },
                  "url": {
                    "type": "string"
                  }
                }
              }
            },
            "timestamp": {
              "type": "string"
            }
          },
          "required": [
            "topic",
            "report",
            "sources"
          ]
        },
    },
  ],
};
