# Project Change Log

This document summarizes all changes made to the project to resolve errors and implement new features.

## 1. Fixed Build Error (Missing Utilities)
**Issue:** The build was failing because `utils/fileUtils.ts` was missing, causing an import error in `PreWeddingGen.tsx`.
**Changes:**
- **Created `utils/fileUtils.ts`**:
  - Added `fileToBase64(file)`: Converts a file to a raw base64 string for API usage.
  - Added `getMimeType(file)`: Helper to extract file MIME types.

## 2. Added Image Watermark
**Feature:** Automatically adds "MoonVeil Studio" watermark to generated images.
**Changes:**
- **Created `utils/imageUtils.ts`**:
  - Added `addWatermark(base64Image, text)`: Uses HTML5 Canvas to overlay text onto the image.
  - Configured to place text in the bottom-right corner with a shadow for visibility.
- **Modified `components/PreWeddingGen.tsx`**:
  - Integrated `addWatermark` into the generation flow. The app now displays and saves the watermarked version of the image.

## 3. Implemented API Test Mode
**Feature:** Allows bypassing the Google Gemini API to avoid quota limits during development.
**Changes:**
- **Modified `services/geminiService.ts`**:
  - Added a check for `import.meta.env.VITE_USE_MOCK === 'true'`.
  - If active, returns a mock placeholder image after a simulated delay instead of calling the API.
- **Created `vite-env.d.ts`**:
  - Added TypeScript definitions for `ImportMetaEnv` to fix linting errors related to environment variables.
**Usage:** Add `VITE_USE_MOCK=true` to your `.env.local` file to enable.

## 4. Toast Notifications
**Feature:** Replaced browser alerts with professional toast notifications.
**Changes:**
- **Installed `sonner`**: A lightweight toast notifications library.
- **Modified `App.tsx`**:
  - Added the `<Toaster />` component to the application root to enable global notifications.
- **Modified `components/PreWeddingGen.tsx`**:
  - Replaced `alert()` calls with `toast.error()`.
  - Added `toast.success()` for successful photo generation.
