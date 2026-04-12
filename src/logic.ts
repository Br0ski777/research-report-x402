import type { Hono } from "hono";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SourceContent {
  title: string;
  url: string;
  snippet: string;
  content: string;
}

async function searchDuckDuckGo(query: string, count: number): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query);
  const response = await fetch(`https://html.duckduckgo.com/html/?q=${encoded}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  const html = await response.text();
  const results: SearchResult[] = [];

  const resultBlocks = html.split('class="result__body"');
  for (let i = 1; i < resultBlocks.length && results.length < count; i++) {
    const block = resultBlocks[i];

    const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)</);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const urlMatch = block.match(/class="result__url"[^>]*href="([^"]*)"/) ||
                     block.match(/class="result__a"[^>]*href="([^"]*)"/);
    let url = urlMatch ? urlMatch[1].trim() : "";
    if (url.includes("uddg=")) {
      const uddgMatch = url.match(/uddg=([^&]+)/);
      if (uddgMatch) url = decodeURIComponent(uddgMatch[1]);
    }
    if (!url.startsWith("http")) {
      const urlTextMatch = block.match(/class="result__url"[^>]*>\s*([^<\s]+)/);
      if (urlTextMatch) url = "https://" + urlTextMatch[1].trim();
    }

    const snippetMatch = block.match(/class="result__snippet"[^>]*>([^<]+(?:<[^>]+>[^<]*)*)/);
    let snippet = snippetMatch ? snippetMatch[1].trim() : "";
    snippet = snippet.replace(/<[^>]+>/g, "").trim();

    if (title && url) {
      results.push({ title, url, snippet });
    }
  }

  return results;
}

async function fetchPageContent(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const html = await response.text();

    // Extract text content, strip HTML
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Limit to first 2000 chars
    return text.slice(0, 2000);
  } catch {
    return "";
  }
}

function compileReport(topic: string, sources: SourceContent[]): string {
  const validSources = sources.filter((s) => s.content || s.snippet);

  let report = `# Research Report: ${topic}\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Sources analyzed:** ${validSources.length}\n\n`;

  // Summary section
  report += `## Summary\n\n`;
  const allSnippets = validSources.map((s) => s.snippet).filter(Boolean);
  if (allSnippets.length > 0) {
    report += allSnippets.join(" ") + "\n\n";
  }

  // Key findings
  report += `## Key Findings\n\n`;
  for (let i = 0; i < validSources.length; i++) {
    const source = validSources[i];
    report += `### ${i + 1}. ${source.title}\n\n`;
    if (source.content) {
      // Extract first meaningful paragraph
      const paragraphs = source.content.split(/\.\s+/).filter((p) => p.length > 50);
      const excerpt = paragraphs.slice(0, 3).join(". ") + ".";
      report += excerpt + "\n\n";
    } else if (source.snippet) {
      report += source.snippet + "\n\n";
    }
    report += `*Source: [${source.url}](${source.url})*\n\n`;
  }

  // Sources list
  report += `## Sources\n\n`;
  for (let i = 0; i < validSources.length; i++) {
    report += `${i + 1}. [${validSources[i].title}](${validSources[i].url})\n`;
  }

  return report;
}

export function registerRoutes(app: Hono) {
  app.post("/api/report", async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body?.topic) {
      return c.json({ error: "Missing required field: topic" }, 400);
    }

    const topic: string = body.topic;
    const depth: string = (body.depth || "standard").toLowerCase();
    const depthMap: Record<string, number> = { quick: 3, standard: 5, deep: 8 };
    const sourceCount = depthMap[depth] || 5;

    if (!depthMap[depth]) {
      return c.json({ error: `Invalid depth. Supported: quick, standard, deep` }, 400);
    }

    try {
      // Search for sources
      const searchResults = await searchDuckDuckGo(topic, sourceCount);

      // Fetch content from each source in parallel
      const sources: SourceContent[] = await Promise.all(
        searchResults.map(async (result) => {
          const content = await fetchPageContent(result.url);
          return {
            title: result.title,
            url: result.url,
            snippet: result.snippet,
            content,
          };
        })
      );

      // Compile report
      const report = compileReport(topic, sources);

      return c.json({
        topic,
        depth,
        sourcesAnalyzed: sources.length,
        report,
        sources: sources.map((s) => ({ title: s.title, url: s.url })),
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return c.json({ error: "Report generation failed: " + error.message }, 500);
    }
  });
}
