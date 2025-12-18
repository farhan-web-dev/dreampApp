import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

// Models
const CHAT_MODEL = 'gemini-3-pro-preview';
const EDIT_MODEL_NANO = 'gemini-2.5-flash-image';
const GEN_MODEL_HIGH_QUALITY = 'gemini-3-pro-image-preview';

// Helper to get a new AI client instance (important for picking up updated API keys)
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Chat with the AI assistant (Streaming)
 */
export const createChatSession = () => {
  const ai = getAiClient();
  return ai.chats.create({
    model: CHAT_MODEL,
    config: {
      systemInstruction: 'You are a helpful and knowledgeable wedding planning assistant. You can help with scheduling, etiquette, style advice, and general questions.',
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  return await chat.sendMessageStream({ message });
};

/**
 * Edit an image using Gemini 2.5 Flash Image (Nano Banana)
 */
export const editImage = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: EDIT_MODEL_NANO,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image generated.');
  } catch (error) {
    console.error('Edit Image Error:', error);
    throw error;
  }
};

/**
 * Generate Pre-wedding photo using Gemini 3 Pro Image Preview
 * This treats the task as a high-fidelity image-to-image/generation task.
 */
export const generatePreWeddingPhoto = async (
  referenceImages: { base64: string; mimeType: string }[],
  styleDescription: string,
  customPrompt?: string
): Promise<string> => {
  // MOCK MODE CHECK
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log("Mock Mode Active: Returning placeholder image.");
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple grey placeholder image (1x1 pixel)
        resolve("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwKwQAAAABJRU5ErkJggg==");
      }, 2000); // Simulate 2s latency
    });
  }

  try {
    const ai = getAiClient();
    const parts = [];

    // Add reference images
    referenceImages.forEach((img) => {
      parts.push({
        inlineData: {
          data: img.base64,
          mimeType: img.mimeType,
        },
      });
    });

    // Construct the prompt
    let promptText = `
    Generate a high-quality, professional pre-wedding photo based on these rules:
    1. Identity Preservation: Use the uploaded photos as the source for facial identity. Maintain face shape, eyes, skin tone.
    2. Style: ${styleDescription}
    3. Quality: Cinematic lighting, 4k resolution, photorealistic, sharp focus.
    `;

    if (customPrompt) {
      promptText += `\n4. Additional Details: ${customPrompt}`;
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: GEN_MODEL_HIGH_QUALITY,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
            imageSize: '2K',
            aspectRatio: '3:4' // Portrait-ish suitable for wedding photos
        }
      }
    });

     // Extract image from response
     for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error('No pre-wedding image generated.');

  } catch (error) {
    console.error('Pre-wedding Gen Error:', error);
    throw error;
  }
};