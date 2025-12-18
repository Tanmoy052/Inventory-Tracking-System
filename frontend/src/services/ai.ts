
import { GoogleGenAI } from "@google/genai";
import { StockWithDetails } from "../types";

export const analyzeLowStock = async (lowStockItems: StockWithDetails[]) => {
  if (lowStockItems.length === 0) return "No low stock items detected. All inventory levels are optimal.";

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    const deficits = lowStockItems
      .map(i => ({
        itemName: i.itemName,
        itemCode: i.itemCode,
        locationName: i.locationName,
        current: i.currentQuantity,
        min: i.minQuantity,
        deficit: Math.max(i.minQuantity - i.currentQuantity, 0),
      }))
      .sort((a, b) => b.deficit - a.deficit);

    const top = deficits.slice(0, 3);
    const lines = top.map(d => `• ${d.itemName} (${d.itemCode}) @ ${d.locationName}: deficit ${d.deficit} (current ${d.current}, required ${d.min})`);

    const actions = [
      "Prioritize procurement for highest deficits within 24–48 hours.",
      "Bundle replenishment by location to reduce handling costs.",
      "Set reorder points 10–20% above minimum to prevent recurrence."
    ];

    const summaryHeader = `Critical shortages identified: ${deficits.length}. Highest impact items listed below.`;
    const summaryBody = lines.join("\n");
    const actionBody = actions.map(a => `- ${a}`).join("\n");

    return `${summaryHeader}\n\n${summaryBody}\n\nRecommended actions:\n${actionBody}`;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';

  const inventorySummary = lowStockItems.map(i => 
    `- Item: ${i.itemName} (${i.itemCode}), Location: ${i.locationName}, Current: ${i.currentQuantity}, Minimum Needed: ${i.minQuantity}`
  ).join('\n');

  const prompt = `
    As an expert Supply Chain Analyst, analyze the following low-stock inventory report and provide a concise, high-impact summary. 
    Focus on critical shortages and provide 2-3 actionable insights for the procurement team.
    
    REPORT DATA:
    ${inventorySummary}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a professional logistics and supply chain assistant. Provide structured, executive-level insights. Be professional and brief."
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    const deficits = lowStockItems
      .map(i => ({
        itemName: i.itemName,
        itemCode: i.itemCode,
        locationName: i.locationName,
        current: i.currentQuantity,
        min: i.minQuantity,
        deficit: Math.max(i.minQuantity - i.currentQuantity, 0),
      }))
      .sort((a, b) => b.deficit - a.deficit);
    const top = deficits.slice(0, 3);
    const lines = top.map(d => `• ${d.itemName} (${d.itemCode}) @ ${d.locationName}: deficit ${d.deficit} (current ${d.current}, required ${d.min})`);
    const summaryHeader = `AI unavailable. Deterministic summary generated. Shortages: ${deficits.length}.`;
    const actions = [
      "Escalate purchase orders for top deficits immediately.",
      "Consolidate restock shipments per location.",
      "Review safety stock thresholds and lead times."
    ];
    const actionBody = actions.map(a => `- ${a}`).join("\n");
    return `${summaryHeader}\n\n${lines.join("\n")}\n\nRecommended actions:\n${actionBody}`;
  }
};
