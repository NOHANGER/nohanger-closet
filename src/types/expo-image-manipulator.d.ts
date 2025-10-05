declare module "expo-image-manipulator" {
  export type SaveFormat = "jpeg" | "png" | "webp" | "heic";

  export interface SaveOptions {
    base64?: boolean;
    compress?: number;
    format?: SaveFormat;
  }

  export interface Resize {
    width?: number;
    height?: number;
  }

  export interface ActionResize {
    resize: Resize;
  }

  export type Action = ActionResize;

  export interface ManipulateOptions extends SaveOptions {}

  export interface ManipulateResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  }

  export function manipulateAsync(
    uri: string,
    actions: Action[],
    options?: ManipulateOptions
  ): Promise<ManipulateResult>;
}
