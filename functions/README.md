# Firebase Functions for Gemini API

This directory contains the method to securely call the Gemini API from a backend, complying with production security practices.

## 1. Setup

Prerequisites:
- [Node.js 18+](https://nodejs.org/)
- [Firebase CLI](https://firebase.google.com/docs/cli) installed (`npm install -g firebase-tools`)

### Install Dependencies
Navigate to the `functions` directory and install:
```bash
cd functions
npm install
```

## 2. Configuration (Environment Variables)

The backend now supports **Test Mode** (Free Key) and **Production Mode** (Paid Key), similar to your frontend logic.

**Environment Variables Required:**
- `GEMINI_FREE_KEY`: Your free tier / test API key.
- `GEMINI_PAID_KEY`: Your paid / production API key.
- `GEMINI_API_KEY`: Fallback key if above are missing.
- `TEST_MODE`: Set to `true` to use the Free Key. Set to `false` or omit for Production Key.

**Option A: Using `.env` file (Recommended for local dev)**
Create a `.env` file in the `functions/` folder:
```
GEMINI_FREE_KEY=your_free_key
GEMINI_PAID_KEY=your_paid_key
TEST_MODE=true
```

**Option B: Setting for Production Deployment**
When deploying to Firebase, we recommend using parameterized configuration or secrets, but `.env` also works for V2 functions.

Example of setting config variables via CLI (if not using .env):
```bash
# Set secrets (Recommended for keys)
firebase functions:secrets:set GEMINI_FREE_KEY
firebase functions:secrets:set GEMINI_PAID_KEY

# Set configuration
firebase functions:config:set mode.test="true" # (Requires reading config in code, .env is easier for V2)
```
*Note: The code logic simply uses `process.env.TEST_MODE`. Ensure this is set in your layout or .env file.*

## 3. Deployment

1. **Login to Firebase**:
   ```bash
   firebase login
   ```

2. **Initialize/Link Project** (if not done):
   ```bash
   firebase init functions
   # Select "Use an existing project" and choose your Firebase project.
   # Decline overwriting existing files if asked (we already created them).
   ```

3. **Deploy**:
   Run this from the project root or functions folder:
   ```bash
   firebase deploy --only functions
   ```
   
   After deployment, you will get a URL, e.g., `https://generateimage-<project-id>.cloudfunctions.net/generateImage`.

## 4. Frontend Integration Example

Replace your direct API calls in `services/geminiService.ts` with a fetch to your new endpoint.

### Example Code

```typescript
// services/geminiService.ts (Modified)

const API_ENDPOINT = "https://your-firebase-function-url/generateImage"; // Replace with actual URL

export const editImage = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64, // Make sure this is the full data URL (with prefix) or just base64 depending on index.js logic. (index.js handles stripping prefix)
        prompt,
      }),
    });

    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error || "Failed to generate image");
    }

    const data = await response.json();
    
    // If your backend returns { image: "data:image..." }
    if (data.image) {
        return data.image;
    }
    
    // If using a text-based model that returns a description
    if (data.text) {
        return data.text; 
    }
    
    throw new Error("No valid data returned");

  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};
```

## Troubleshooting
- **CORS Errors**: If you see CORS errors in the browser, ensure the request is going to the correct URL and the backend function is successful (check Firebase logs).
- **500 Errors**: Check Firebase Console > Functions > Logs. Often caused by missing `GEMINI_API_KEY`.
