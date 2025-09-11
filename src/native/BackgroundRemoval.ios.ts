import { requireNativeModule } from 'expo-modules-core';

type NativeModule = {
  removeBackgroundAsync: (imagePath: string) => Promise<string>;
};

let _module: NativeModule | null = null;

export function getNativeModule(): NativeModule | null {
  if (_module) return _module;
  try {
    // Name must match the Swift module Name("BackgroundRemovalModule")
    _module = requireNativeModule<NativeModule>('BackgroundRemovalModule');
    return _module;
  } catch {
    return null;
  }
}

export async function removeBackgroundNative(imagePath: string): Promise<string> {
  const mod = getNativeModule();
  if (!mod) throw new Error('BackgroundRemovalModule not available');
  return mod.removeBackgroundAsync(imagePath);
}

