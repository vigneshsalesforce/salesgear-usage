export type AgentType =
  | "SDR Agent"
  | "Marketing Agent"
  | "Search Agent"
  | "WebScraper"
  | "RAG"
  | "Quote"
  | "Other";

const AGENT_PRICES: Record<AgentType, { costPerEvent: number }> = {
  "SDR Agent": { costPerEvent: 0.05 },        
  "Marketing Agent": { costPerEvent: 0.10 },
  "Search Agent": { costPerEvent: 0.02 },
  WebScraper: { costPerEvent: 0.03 },
  RAG: { costPerEvent: 0.08 },
  Quote: { costPerEvent: 0.15 },
  Other: { costPerEvent: 0.01 }
};

export function normalizeAgentName(agentName?: string): AgentType {
  switch ((agentName ?? "").toLowerCase()) {
    case "sdr agent": return "SDR Agent";
    case "marketing agent": return "Marketing Agent";
    case "search agent": return "Search Agent";
    case "webscraper":
    case "web-scraper":
    case "scraper": return "WebScraper";
    case "rag": return "RAG";
    case "quote": return "Quote";
    default: return "Other";
  }
}

export function estimateAgentCost(agentName?: string) {
  const agentType = normalizeAgentName(agentName);
  return {
    agentType,
    cost_usd: AGENT_PRICES[agentType].costPerEvent
  };
}