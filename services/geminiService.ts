import { GoogleGenAI, Type } from "@google/genai";
import { mockStocks, mockMutualFunds, mockPortfolioHoldings } from './mockDataService';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API will not be available.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const getApiResponse = async (prompt: string, fallbackMessage: string): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve(fallbackMessage);
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        return "Sorry, I encountered an error while processing your request. Please try again.";
    }
};

export const getAIBriefing = async (): Promise<string> => {
    const prompt = `
      Act as "Zenith AI", an expert financial analyst. Your user, Rohan, is checking his "Zenith Invest" app before the market opens. 
      Provide a concise, personalized, and proactive morning briefing based on the provided data.
      The tone should be professional yet encouraging. Use markdown for formatting.

      CONTEXT DATA:
      - Key Market News (mock): Positive sentiment in the IT sector due to strong global cues. Metals are expected to be volatile.
      - User Portfolio: ${JSON.stringify(mockPortfolioHoldings.map(p => ({name: p.name, type: p.type, quantity: p.quantity, investment: p.avgPrice * p.quantity, currentValue: p.currentPrice * p.quantity})))}
      - High Expense Ratio Fund Example: A fund in the user's portfolio, "Parag Parikh Flexi Cap Fund", has an expense ratio of 0.64%. Assume this is higher than 85% of its peers for this example.

      TASK:
      Generate a sample briefing script in the first person. For example: "Good morning, Rohan...".
      1. Give a quick market outlook based on the news.
      2. Comment on how this might affect Rohan's specific holdings (e.g., his IT stocks).
      3. Provide one actionable insight. For this, highlight the high expense ratio of the "Parag Parikh Flexi Cap Fund" and suggest a review.
      4. End with a positive closing remark.
    `;
    return getApiResponse(prompt, "The AI briefing is currently unavailable. Please check your API key configuration.");
}

export const getCopilotResponse = async (query: string): Promise<string> => {
  const prompt = `
      You are "Zenith AI", a helpful financial assistant for the 'Zenith Invest' app.
      Your goal is to provide concise, accurate, and easy-to-understand answers to the user's query based on the provided data.
      Do not hallucinate or provide information beyond the context given.
      Format your response clearly using markdown for readability.

      CONTEXT DATA:
      Stocks Data: ${JSON.stringify(mockStocks.map(s => ({ name: s.name, symbol: s.symbol, price: s.price, breakoutScore: s.breakoutScore })))}
      Mutual Funds Data: ${JSON.stringify(mockMutualFunds)}
      User Portfolio Data: ${JSON.stringify(mockPortfolioHoldings.map(p => ({name: p.name, type: p.type, quantity: p.quantity, investment: p.avgPrice * p.quantity, currentValue: p.currentPrice * p.quantity})))}

      USER QUERY: "${query}"

      Based on the user query and the context data, provide a helpful response.
    `;
    return getApiResponse(prompt, "The AI Copilot is currently unavailable. Please check your API key configuration.");
};