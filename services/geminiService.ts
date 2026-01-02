
import { GoogleGenAI } from "@google/genai";
import { Card, GamePhase } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPokerCommentary = async (
  playerHand: Card[],
  communityCards: Card[],
  phase: GamePhase,
  pot: number,
  playerChips: number
): Promise<string> => {
  try {
    const handStr = playerHand.map(c => `${c.rank} of ${c.suit}`).join(', ');
    const communityStr = communityCards.length > 0 
      ? communityCards.map(c => `${c.rank} of ${c.suit}`).join(', ')
      : 'None';

    const prompt = `You are a professional, slightly sarcastic Las Vegas Poker Dealer named "Ace". 
    Phase: ${phase}. 
    Pot: ${pot} chips. 
    Player's Hand: ${handStr}. 
    Community Cards: ${communityStr}.
    Player's Chips: ${playerChips}.
    Give a short, witty (1-2 sentences) comment about the current situation. Don't give away mathematical odds too explicitly, but hint if the player is in a good or bad spot. Be charismatic.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Eyes on the cards, friend. The felt never lies.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The deck is shuffled and ready.";
  }
};

export const generateAvatar = async (characterName: string, isAI: boolean): Promise<string> => {
  try {
    const prompt = isAI 
      ? `A professional high-stakes poker player portrait for a character named "${characterName}", cinematic lighting, digital art style, suave look, detailed facial features, elegant clothing.`
      : `A charismatic high-stakes poker player portrait for the player, digital art style, mysterious look, cinematic lighting, sharp detail.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (error) {
    console.error("Avatar Generation Error:", error);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${characterName}`;
  }
};
