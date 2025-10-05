import { ClothingItem } from "../types/ClothingItem";
import * as FileSystem from "expo-file-system/legacy";
import { extractDominantColors } from "./ColorExtraction";

const REMOTE_TAGGING_DISABLED = process.env.EXPO_PUBLIC_REMOTE_TAGGING === "off";
const TAGGING_ENDPOINT = process.env.EXPO_PUBLIC_TAGGING_ENDPOINT;
const TAGGING_API_KEY = process.env.EXPO_PUBLIC_TAGGING_API_KEY;

type RemoteTagArray = string[] | undefined;

type RemoteTaggingResponse = {
  category?: string;
  subcategory?: string;
  colors?: RemoteTagArray;
  color?: RemoteTagArray | string;
  season?: RemoteTagArray | string;
  seasons?: RemoteTagArray;
  occasion?: RemoteTagArray | string;
  occasions?: RemoteTagArray;
  tags?: RemoteTagArray | string;
};

const toStringArray = (input: RemoteTagArray | string): string[] => {
  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof input === "string" && input.trim().length > 0) {
    return input
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean);
  }
  return [];
};

const normaliseRemoteResponse = (payload: RemoteTaggingResponse) => {
  const colors = toStringArray(payload.colors ?? payload.color ?? []);
  const season = toStringArray(payload.seasons ?? payload.season ?? []);
  const occasion = toStringArray(payload.occasions ?? payload.occasion ?? []);
  const tags = toStringArray(payload.tags ?? []);

  return {
    category: payload.category ?? "",
    subcategory: payload.subcategory ?? "",
    color: colors,
    season,
    occasion,
    tags,
  } satisfies Partial<ClothingItem>;
};

export const categorizeClothing = async (imageUri: string): Promise<Partial<ClothingItem>> => {
  const fallback: Partial<ClothingItem> = {
    category: "",
    subcategory: "",
    color: [],
    season: [],
    occasion: [],
    tags: [],
  };

  try {
    console.debug("[Categorization Service] Request Initiated Time:", new Date().toISOString());

    const localColors = await extractDominantColors(imageUri);
    fallback.color = localColors;

    const remoteAllowed = Boolean(TAGGING_ENDPOINT) && !REMOTE_TAGGING_DISABLED;

    if (!remoteAllowed) {
      if (!localColors.length) {
        console.warn("[Categorization Service] Remote tagging disabled; only colors will be suggested.");
      }
      return fallback;
    }

    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });

    const body = {
      image: base64,
      imageFormat: "jpeg",
      detectedColors: localColors,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (TAGGING_API_KEY) {
      headers.Authorization = `Bearer ${TAGGING_API_KEY}`;
    }

    const response = await fetch(TAGGING_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Remote tagging failed: ${response.status} ${errorText}`);
    }

    const json = (await response.json()) as RemoteTaggingResponse;
    const normalised = normaliseRemoteResponse(json);

    return {
      ...fallback,
      ...normalised,
      color: normalised.color && normalised.color.length > 0 ? normalised.color : fallback.color,
    };
  } catch (error) {
    console.error("Error categorizing clothing:", error);
    return fallback;
  }
};
