import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

/**
 * Upload un buffer vers Cloudinary avec transformation auto
 * (WebP/AVIF + quality auto + limite largeur 2400px)
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder = "probois-design/realisations",
) {
  return new Promise<{
    url: string;
    public_id: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 2400, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          });
        },
      )
      .end(buffer);
  });
}
