import { manipulateAsync } from "expo-image-manipulator";
import { Buffer } from "buffer";
import { decode } from "jpeg-js";

const COLOR_PALETTE: Record<string, [number, number, number]> = {
  Black: [0, 0, 0],
  White: [255, 255, 255],
  Gray: [128, 128, 128],
  Blue: [70, 100, 200],
  Pink: [232, 140, 180],
  Beige: [214, 196, 170],
  Brown: [121, 85, 61],
  Orange: [240, 140, 60],
  Red: [200, 60, 70],
  Yellow: [245, 210, 70],
  Purple: [150, 110, 190],
  Green: [90, 150, 90],
};

const DIMENSION = 64;
const IGNORE_BRIGHTNESS_THRESHOLD = 248; // Skip pure white background pixels
const MAX_COLOR_RESULTS = 3;

const getNearestColor = (r: number, g: number, b: number): string => {
  let bestMatch = "White";
  let bestDistance = Number.POSITIVE_INFINITY;

  Object.entries(COLOR_PALETTE).forEach(([name, [cr, cg, cb]]) => {
    const distance = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = name;
    }
  });

  return bestMatch;
};

export const extractDominantColors = async (imageUri: string): Promise<string[]> => {
  try {
    const manipulated = await manipulateAsync(
      imageUri,
      [{ resize: { width: DIMENSION } }],
      { compress: 0.5, format: "jpeg", base64: true }
    );

    if (!manipulated.base64) {
      throw new Error("Image manipulation failed to produce base64 data");
    }

    const buffer = Buffer.from(manipulated.base64, "base64");
    const { data } = decode(buffer, { useTArray: true, formatAsRGBA: true });

    const colorCounts = new Map<string, number>();

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) {
        continue;
      }

      if (r > IGNORE_BRIGHTNESS_THRESHOLD && g > IGNORE_BRIGHTNESS_THRESHOLD && b > IGNORE_BRIGHTNESS_THRESHOLD) {
        continue;
      }

      const colorName = getNearestColor(r, g, b);
      colorCounts.set(colorName, (colorCounts.get(colorName) ?? 0) + 1);
    }

    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    if (sortedColors.length === 0) {
      return ["White"];
    }

    return sortedColors.slice(0, MAX_COLOR_RESULTS);
  } catch (error) {
    console.warn("[Color Extraction] Failed to identify colors", error);
    return [];
  }
};
