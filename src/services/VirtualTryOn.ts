import * as FileSystem from "expo-file-system/legacy";
import jwt from "expo-jwt";

const API_BASE_URL = "https://api.klingai.com";

// WARNING: EXPO_PUBLIC_ variables are compiled into the app bundle and can be
// extracted from the binary. Before shipping to production, these calls must be
// proxied through a secure backend that holds these credentials server-side.
const ACCESS_KEY = process.env.EXPO_PUBLIC_KWAI_ACCESS_KEY;
const SECRET_KEY = process.env.EXPO_PUBLIC_KWAI_SECRET_KEY;

const POLL_INTERVAL = 1000; // 1 second between polls
const MAX_RETRIES = 60; // Maximum number of polling attempts (60 seconds total)

export type TryOnRequest = {
  outfitImageUri: string;
  userPhotoUri: string;
};

export type TryOnResponse = {
  resultImageUri: string;
};

type TaskStatus = "submitted" | "processing" | "succeed" | "failed";

type CreateTaskResponse = {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: TaskStatus;
    created_at: number;
    updated_at: number;
  };
};

type QueryTaskResponse = {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: TaskStatus;
    task_status_msg: string;
    created_at: number;
    updated_at: number;
    task_result?: {
      images: Array<{
        index: number;
        url: string;
      }>;
    };
  };
};

// Generate JWT token for API authorization
const generateToken = (): string => {
  if (!SECRET_KEY) throw new Error("SECRET_KEY is not defined");

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ACCESS_KEY,
    exp: now + 1800, // 30 minutes expiry
    nbf: now - 5, // Valid from 5 seconds ago
  };

  return jwt.encode(payload, SECRET_KEY);
};

const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to read image file: ${msg}`);
  }
};

const createTask = async (
  humanImageBase64: string,
  clothImageBase64: string,
  signal?: AbortSignal
): Promise<string> => {
  const token = generateToken();

  const response = await fetch(`${API_BASE_URL}/v1/images/kolors-virtual-try-on`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model_name: "kolors-virtual-try-on-v1",
      human_image: humanImageBase64,
      cloth_image: clothImageBase64,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Task creation failed (${response.status}): ${errorText}`);
  }

  const data: CreateTaskResponse = await response.json();

  if (data.code !== 0) {
    throw new Error(data.message || "Failed to create task");
  }

  return data.data.task_id;
};

const queryTask = async (taskId: string, signal?: AbortSignal): Promise<QueryTaskResponse> => {
  const token = generateToken();

  const response = await fetch(`${API_BASE_URL}/v1/images/kolors-virtual-try-on/${taskId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Task query failed (${response.status}): ${errorText}`);
  }

  const data: QueryTaskResponse = await response.json();

  if (data.code !== 0) {
    throw new Error(data.message || "Failed to query task");
  }

  return data;
};

const pollTaskCompletion = async (taskId: string, signal?: AbortSignal): Promise<string> => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    if (signal?.aborted) {
      throw new Error("Virtual try-on was cancelled");
    }

    const taskData = await queryTask(taskId, signal);
    const status = taskData.data.task_status;

    switch (status) {
      case "succeed":
        if (taskData.data.task_result?.images[0]?.url) {
          return taskData.data.task_result.images[0].url;
        }
        throw new Error("No result image found");

      case "failed":
        throw new Error(taskData.data.task_status_msg || "Virtual try-on failed");

      case "submitted":
      case "processing":
        await new Promise<void>((resolve, reject) => {
          const t = setTimeout(resolve, POLL_INTERVAL);
          signal?.addEventListener("abort", () => {
            clearTimeout(t);
            reject(new Error("Virtual try-on was cancelled"));
          }, { once: true });
        });
        retries++;
        break;

      default:
        throw new Error("Unknown task status");
    }
  }

  throw new Error("Timeout waiting for virtual try-on result");
};

export const virtualTryOn = async (request: TryOnRequest, signal?: AbortSignal): Promise<TryOnResponse> => {
  if (__DEV__) console.debug("[VTON Service] Request Initiated Time:", new Date().toISOString());

  // Convert images to base64
  const [humanImageBase64, clothImageBase64] = await Promise.all([
    imageToBase64(request.userPhotoUri),
    imageToBase64(request.outfitImageUri),
  ]);

  // Create task
  const taskId = await createTask(humanImageBase64, clothImageBase64, signal);
  if (__DEV__) console.debug("[VTON Service] Task created:", taskId);

  // Poll for result
  const resultUrl = await pollTaskCompletion(taskId, signal);
  if (__DEV__) console.debug("[VTON Service] Result URL received");

  // Download result image and save locally
  const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDir) {
    throw new Error("No writable directory available for storing try-on result");
  }
  const localUri = `${baseDir}try-on-${taskId}.jpg`;
  await FileSystem.downloadAsync(resultUrl, localUri);

  return {
    resultImageUri: localUri,
  };
};
