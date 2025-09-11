import ExpoModulesCore
import Vision
import CoreImage
import UIKit

public class BackgroundRemovalModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BackgroundRemovalModule")

    AsyncFunction("removeBackgroundAsync") { (imagePath: String) -> String in
      // Load image
      guard let url = URL(string: imagePath) ?? URL(string: imagePath.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "") ?? URL(fileURLWithPath: imagePath.replacingOccurrences(of: "file://", with: "")) else {
        throw GenericException("Invalid image path")
      }
      guard let data = try? Data(contentsOf: url), let uiImage = UIImage(data: data), let cgImage = uiImage.cgImage else {
        throw GenericException("Failed to load image")
      }

      // Prepare Core Image context
      let ciContext = CIContext(options: nil)
      let ciImage = CIImage(cgImage: cgImage)

      // iOS 17+: General foreground mask works for non-person items
      if #available(iOS 17.0, *) {
        let request = VNGenerateForegroundInstanceMaskRequest()
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
          try handler.perform([request])
          if let result = request.results?.first as? VNForegroundInstanceMaskObservation,
             let maskBuffer = try? result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler) {
            let maskImage = CIImage(cvPixelBuffer: maskBuffer)

            let transparent = CIImage(color: .clear).cropped(to: ciImage.extent)
            guard let blendFilter = CIFilter(name: "CIBlendWithMask") else { return imagePath }
            blendFilter.setValue(transparent, forKey: kCIInputBackgroundImageKey)
            blendFilter.setValue(ciImage, forKey: kCIInputImageKey)
            blendFilter.setValue(maskImage, forKey: kCIInputMaskImageKey)

            if let output = blendFilter.outputImage,
               let outCG = ciContext.createCGImage(output, from: output.extent) {
              let outUrl = try Self.writePNG(image: UIImage(cgImage: outCG))
              return outUrl.absoluteString
            }
          }
        } catch {
          // Fall through to person segmentation
        }
      }

      // On-device person segmentation (iOS 15+). Works best when a person is present.
      if #available(iOS 15.0, *) {
        let req = VNGeneratePersonSegmentationRequest()
        req.qualityLevel = .balanced
        req.outputPixelFormat = kCVPixelFormatType_OneComponent8
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
          try handler.perform([req])
          guard let obs = req.results?.first as? VNPixelBufferObservation else {
            return imagePath
          }
          let maskImage = CIImage(cvPixelBuffer: obs.pixelBuffer)
          let transparent = CIImage(color: .clear).cropped(to: ciImage.extent)
          guard let blendFilter = CIFilter(name: "CIBlendWithMask") else { return imagePath }
          blendFilter.setValue(transparent, forKey: kCIInputBackgroundImageKey)
          blendFilter.setValue(ciImage, forKey: kCIInputImageKey)
          blendFilter.setValue(maskImage, forKey: kCIInputMaskImageKey)
          guard let output = blendFilter.outputImage, let outCG = ciContext.createCGImage(output, from: output.extent) else {
            return imagePath
          }
          let outUrl = try Self.writePNG(image: UIImage(cgImage: outCG))
          return outUrl.absoluteString
        } catch {
          return imagePath
        }
      }

      // Old iOS: just return original
      return imagePath
    }
  }

  private static func writePNG(image: UIImage) throws -> URL {
    let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    let url = dir.appendingPathComponent("bg-removed-\(Int(Date().timeIntervalSince1970)).png")
    guard let data = image.pngData() else { throw GenericException("Failed to encode PNG") }
    try data.write(to: url)
    return url
  }
}
