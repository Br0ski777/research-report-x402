import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "research-report",
  slug: "research-report",
  description: "Generate research reports by fetching and compiling multiple web sources on a topic.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/report",
      price: "$0.02",
      description: "Generate a research report on a given topic",
      toolName: "research_generate_report",
      toolDescription: "Use this when you need a comprehensive research report on any topic. Accepts a topic and optional depth parameter. Fetches multiple web sources, extracts key information, and compiles a structured report with summary, key findings, sources, and analysis. Returns markdown-formatted report. Do NOT use for simple web search — use web_search_query instead. Do NOT use for single page scraping — use web_scrape_to_markdown instead. Do NOT use for SEO analysis — use seo_audit_page instead.",
      inputSchema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "The research topic to investigate" },
          depth: { type: "string", description: "Research depth: quick (3 sources), standard (5 sources), deep (8 sources). Default: standard" },
        },
        required: ["topic"],
      },
    },
  ],
};
