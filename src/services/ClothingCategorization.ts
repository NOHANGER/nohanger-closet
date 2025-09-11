import { ClothingItem } from "../types/ClothingItem";
import { categories } from "../data/categories";
import { colors as colorOptions, seasons, occasions } from "../data/options";
import * as FileSystem from "expo-file-system";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_KEY;
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;
const CATEGORIZATION_DISABLED = process.env.EXPO_PUBLIC_CATEGORIZATION === "off";

export const categorizeClothing = async (imageUri: string): Promise<Partial<ClothingItem>> => {
  try {
    console.debug("[Categorization Service] Request Initiated Time:", new Date().toISOString());
    // Offline fallback: bypass any API usage
    if (CATEGORIZATION_DISABLED || (!GEMINI_API_KEY && !OPENAI_API_KEY)) {
      console.warn("[Categorization Service] No API configured or disabled. Using offline defaults.");
      return {
        category: "Tops",
        subcategory: "Other Tops",
        color: [],
        season: [],
        occasion: [],
      };
    }
    // Read the image file and convert it to Base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
    const base64Uri = `data:image/jpeg;base64,${base64}`; // For OpenAI

    // Prepare the system prompt
    const categoriesAndSubcategories = Object.entries(categories)
      .map(([category, subcategories]) => {
        const subcategoriesList = subcategories.join(", ");
        return `${category}: ${subcategoriesList}`;
      })
      .join("; ");
    const colorList = colorOptions.join(", ");
    const seasonList = seasons.join(", ");
    const occasionList = occasions.join(", ");

    const systemPrompt = `You are an AI assistant that categorizes clothing items based on images.
    The possible categories and their subcategories are: ${categoriesAndSubcategories}.
    The possible colors are: ${colorList}.
    The possible seasons are: ${seasonList}.
    The possible occasions are: ${occasionList}.
    Please provide the most appropriate category, subcategory, colors, seasons, and occasions for the given clothing item.
    The category and subcategory should be selected from the list of categories and subcategories provided.
    Ensure that the subcategory corresponds to the correct category.
    If more than one color applies, please provide the top 5 colors in the order of decreasing prominence.
    More than one season or occasion may apply, so please provide all that are relevant.`;

    // Define a common JSON schema for both providers
    const jsonSchema = {
      type: "object",
      properties: {
        category: { type: "string" },
        subcategory: { type: "string" },
        color: { type: "array", items: { type: "string" } },
        season: { type: "array", items: { type: "string" } },
        occasion: { type: "array", items: { type: "string" } },
      },
      required: ["category", "subcategory", "color", "season", "occasion"],
      additionalProperties: false,
    } as const;

    let parsedData: any;

    if (GEMINI_API_KEY) {
      // Use Google Gemini
      const model = "gemini-1.5-flash-latest";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const body = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  systemPrompt +
                  "\nReturn only a JSON object that strictly follows the schema. Do not include explanations.",
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          response_schema: {
            type: "OBJECT",
            properties: {
              category: { type: "STRING" },
              subcategory: { type: "STRING" },
              color: { type: "ARRAY", items: { type: "STRING" } },
              season: { type: "ARRAY", items: { type: "STRING" } },
              occasion: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["category", "subcategory", "color", "season", "occasion"],
            additionalProperties: false,
          },
        },
      } as const;

      console.debug("[Categorization Service] (Gemini) Request Submitted Time:", new Date().toISOString());
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Gemini API error: ${resp.status} ${errorText}`);
      }

      const json = await resp.json();
      console.debug("[Categorization Service] (Gemini) Response Received Time:", new Date().toISOString());
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini API returned no text");
      parsedData = JSON.parse(text);
    } else if (OPENAI_API_KEY) {
      // Use OpenAI as before
      const requestBody = {
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Please categorize this clothing item based on the image." },
              { type: "image_url", image_url: { url: base64Uri, detail: "low" } },
            ],
          },
        ],
        response_format: { type: "json_schema", json_schema: { name: "clothing_categorization", strict: true, schema: jsonSchema } },
      } as const;

      console.debug("[Categorization Service] (OpenAI) Request Submitted Time:", new Date().toISOString());
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      console.debug("[Categorization Service] (OpenAI) Response Received Time:", new Date().toISOString());
      const aiContent = responseData.choices[0].message.content;
      parsedData = JSON.parse(aiContent);
    } else {
      throw new Error("No AI provider configured. Set EXPO_PUBLIC_GEMINI_KEY or EXPO_PUBLIC_OPENAI_KEY.");
    }

    return {
      category: parsedData.category,
      subcategory: parsedData.subcategory,
      color: parsedData.color,
      season: parsedData.season,
      occasion: parsedData.occasion,
    };
  } catch (error) {
    console.error("Error categorizing clothing:", error);
    throw error;
  }
};
