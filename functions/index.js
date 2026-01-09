import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenAI } from "@google/genai";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    storageBucket: "dreamapp-c833c.firebasestorage.app", // <--- your bucket
  });
}

// const geminiKey = defineSecret("GEMINI_FREE_KEY");
const geminiKey = "AIzaSyAsTakbPM8su2X0cC9vrt6t7TQaCpopn6Q";

export const generatePreWeddingPhoto = onRequest(
  {
    timeoutSeconds: 300,
    region: "us-central1",
    cors: true,
    // secrets: [geminiKey],
  },
  async (req, res) => {
    try {
      // ✅ DEFINE BUCKET HERE
      const bucket = admin.storage().bucket();

      // const key = geminiKey.value();

      const { referenceImages, styleDescription, customPrompt } = req.body;

      if (!referenceImages || !Array.isArray(referenceImages)) {
        return res
          .status(400)
          .json({ error: "referenceImages array required" });
      }

      // const ai = new GoogleGenAI({ apiKey: key });
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const promptParts = [
        {
          text: `
You are a professional cinematic wedding photographer.

TASK:
Generate a cinematic pre-wedding photo based on the provided reference images.

IMPORTANT:
- Preserve faces, skin tone, body shape, and identity of the couple
- Do NOT change age or gender
- Use outfit image only as style reference if provided

QUALITY:
- DSLR realism
- Cinematic lighting
- Romantic mood
- Ultra realistic
- No text in image
- 4K quality

STYLE:
${styleDescription || "romantic cinematic"}

${customPrompt || ""}
          `,
        },
      ];

      for (const img of referenceImages) {
        if (!img.base64 || !img.mimeType) continue;

        promptParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.base64.includes("base64,")
              ? img.base64.split("base64,")[1]
              : img.base64,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: promptParts,
      });

      let generatedBase64 = null;

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          generatedBase64 = part.inlineData.data;
          break;
        }
      }

      if (!generatedBase64) {
        throw new Error("No image returned by Gemini");
      }

      const buffer = Buffer.from(generatedBase64, "base64");
      const filePath = `prewedding/${Date.now()}.png`;
      const file = bucket.file(filePath);

      await file.save(buffer, {
        contentType: "image/png",
        public: true,
      });

      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      return res.json({
        success: true,
        image: imageUrl,
      });
    } catch (err) {
      logger.error("PreWedding Error", err);
      return res.status(500).json({
        error: err.message || "Internal error",
      });
    }
  }
);
