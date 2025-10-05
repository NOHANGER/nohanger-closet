Nohanger Closet
================

Overview
- Mobile wardrobe manager focused on a fast, simple flow: add item, clean background, detect colors, and use in outfits. Built with React Native + Expo.
- Works fully offline by default and can optionally call cloud AI services if you enable them.

Core Features
- Wardrobe: add from camera or gallery; auto-detects prominent colors on-device (no cloud calls) and lets you edit all metadata afterwards; delete items.
- Outfits: compose outfits from items on a canvas and save them for later.
- Community: lightweight feed and quick actions (upload/create/plan/review/read).
- On‑device background removal on iOS via Apple Vision (fallback to original image when unavailable).

Tech Stack
- React Native (Expo SDK 53), TypeScript
- State via React Context + AsyncStorage
- Native iOS module for background removal (Vision)
- Pure JS color analysis (jpeg-js + expo-image-manipulator) for on-device tagging

Getting Started
1) Install dependencies
   - npm install
2) Start in development
   - npm run start
   - Scan with Expo Go for JS-only development (color detection works without a custom client)
3) iOS custom dev client (to use on-device background removal)
   - npx expo prebuild -p ios
   - npx expo run:ios

Optional Integrations (env vars)
- EXPO_PUBLIC_TAGGING_ENDPOINT=https://your-vps/path   # POST endpoint that returns clothing metadata
- EXPO_PUBLIC_TAGGING_API_KEY=...                      # optional bearer token sent as Authorization header
- EXPO_PUBLIC_REMOTE_TAGGING=on                        # enable the remote request (default off)
- EXPO_PUBLIC_BG_REMOVAL=off                           # force background removal off
- EXPO_PUBLIC_FAL_KEY=...                              # remote background removal (if you re-enable it)

Remote tagging request shape (for your VPS endpoint)
- Headers: `Content-Type: application/json` (+ optional `Authorization: Bearer <key>`)
- Body:
  ```json
  {
    "image": "<base64 JPEG>",
    "imageFormat": "jpeg",
    "detectedColors": ["Blue", "White"]
  }
  ```
- Expected response (fields optional):
  ```json
  {
    "category": "Tops",
    "subcategory": "Shirts",
    "colors": ["Blue", "White"],
    "season": ["Spring/Fall"],
    "occasion": ["Casual"],
    "tags": ["Striped", "Weekend"]
  }
  ```

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
