import { onCall } from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";

const MODEL = "gemini-1.5-pro";

// Function to get API key from Firebase config
const getApiKey = () => {
  const functionsConfig = process.env.FIREBASE_CONFIG
    ? JSON.parse(process.env.FIREBASE_CONFIG)
    : {};
  const isTest = functionsConfig?.gemini?.test_mode === "true";
  const freeKey = functionsConfig?.gemini?.free_key;
  const paidKey = functionsConfig?.gemini?.paid_key;
  return isTest ? freeKey : paidKey || freeKey;
};

export const generatePreWeddingPhoto = onCall(async (req) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Missing Gemini API key");

    const { referenceImages, styleDescription, customPrompt } = req.data;

    // Validate input
    if (!Array.isArray(referenceImages) || referenceImages.length === 0) {
      throw new Error("Missing reference images");
    }

    // Prepare reference images
    const parts = referenceImages.map((img) => {
      let base64 = img.base64.includes("base64,")
        ? img.base64.split("base64,")[1]
        : img.base64;
      return {
        inline_data: {
          mime_type: img.mimeType || "image/jpeg",
          data: base64,
        },
      };
    });

    // Prepare prompt
    let prompt = `
Generate a cinematic, photorealistic pre-wedding photo.
Preserve facial identity from reference images.
Style: ${styleDescription}
4K quality, professional lighting.
    `;
    if (customPrompt) prompt += `\nAdditional details: ${customPrompt}`;

    parts.push({ text: prompt });

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts }] }),
      }
    );

    const data = await response.json();

    // Extract generated image
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p) => p.inline_data
    );

    if (!imagePart) {
      logger.error("No image generated", data);
      throw new Error("No image generated");
    }

    // Return image as base64
    return {
      success: true,
      image: `data:image/png;base64,${imagePart.inline_data.data}`,
    };
  } catch (err) {
    logger.error("Function error", err);
    throw new Error(err.message);
  }
});
