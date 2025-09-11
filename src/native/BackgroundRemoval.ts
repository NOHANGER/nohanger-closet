// Non-iOS platforms: fall back to original image
export async function removeBackgroundNative(imagePath: string): Promise<string> {
  return imagePath;
}

