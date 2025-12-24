import { onRequest } from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";

const MODEL = "gemini-1.5-pro";
const TEST_MODE= true;

export const generatePreWeddingPhoto = onRequest(
  {
    timeoutSeconds: 300,
    region: "us-central1",
    cors: true,
    // secrets: ["GEMINI_FREE_KEY", "GEMINI_TEST_MODE"],
  },
  async (req, res) => {
      if (TEST_MODE) {
        const mockImage = `https://picsum.photos/512?random=${Date.now()}`;

        return res.json({
          success: true,
          image: mockImage,
          testMode: true,
        });
      }
    try {
      // const isTest = process.env.GEMINI_TEST_MODE === "true";
      // const apiKey = process.env.GEMINI_FREE_KEY;
      const apiKey = "AIzaSyBdGfoTwwil8JJkNzF_zgkTrC9-bHdmv1o";

      if (!apiKey) {
        throw new Error("Missing Gemini API key");
      }

      const { referenceImages, styleDescription, customPrompt } = req.body;

      if (!Array.isArray(referenceImages) || referenceImages.length === 0) {
        return res.status(400).json({ error: "Missing reference images" });
      }

      const parts = referenceImages.map((img) => {
        const base64 = img.base64.includes("base64,")
          ? img.base64.split("base64,")[1]
          : img.base64;

        return {
          inline_data: {
            mime_type: img.mimeType || "image/jpeg",
            data: base64,
          },
        };
      });

      let prompt = `
Generate a cinematic, photorealistic pre-wedding photo.
Preserve facial identity from reference images.
Style: ${styleDescription}
4K quality, professional lighting.
      `;

      if (customPrompt) prompt += `\nAdditional details: ${customPrompt}`;

      parts.push({ text: prompt });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        logger.error("Gemini API error", data);
        return res.status(500).json({ error: data });
      }

      const imagePart =
        data.candidates?.[0]?.content?.parts?.find((p) => p.inline_data);

      if (!imagePart) {
        return res.status(500).json({ error: "No image generated" });
      }

      return res.json({
        success: true,
        image: `data:image/png;base64,${imagePart.inline_data.data}`,
      });
    } catch (err) {
      logger.error("Function error", err);
      return res.status(500).json({ error: err.message });
    }
  }
);
