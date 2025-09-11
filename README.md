Nohanger Closet
================

Overview
- Mobile wardrobe manager focused on a fast, simple flow: add item, clean background, categorize, and use in outfits. Built with React Native + Expo.
- Works fully offline by default with optional AI integrations you can enable later.

Core Features
- Wardrobe: add from camera or gallery; edit details (category, subcategory, colors, season, occasion, brand, price, tags); delete items.
- Outfits: compose outfits from items on a canvas and save them for later.
- Community: lightweight feed and quick actions (upload/create/plan/review/read).
- On‑device background removal on iOS via Apple Vision (fallback to original image when unavailable).

Tech Stack
- React Native (Expo SDK 53), TypeScript
- State via React Context + AsyncStorage
- Native iOS module for background removal (Vision)

Getting Started
1) Install dependencies
   - npm install
2) Start in development
   - npm run start
   - Scan with Expo Go for JS‑only development
3) iOS custom dev client (to use on‑device background removal)
   - npx expo prebuild -p ios
   - npx expo run:ios

Optional Integrations (env vars)
- EXPO_PUBLIC_BG_REMOVAL=off            # force background removal off
- EXPO_PUBLIC_GEMINI_KEY=...            # categorization via Gemini (preferred if set)
- EXPO_PUBLIC_OPENAI_KEY=...            # categorization via OpenAI (fallback)
- EXPO_PUBLIC_FAL_KEY=...               # remote background removal (if you re‑enable it)

Project Structure
- App entry: App.tsx
- Navigation: src/navigation/
- Screens: src/screens/
- Contexts (state): src/contexts/
- Services (AI, background removal, categorization): src/services/
- Native iOS module: ios/BackgroundRemovalModule.swift

Design Notes
- Colors, spacing, and components are tuned for a soft, neutral look; bottom tab bar matches screen background and uses a light 1px border.
- Background removal prefers on‑device iOS path; remote services are disabled by default and fail gracefully.

Contributing
- PRs are welcome. Please open an issue first for substantial changes so we can align on approach.

License
- MIT
