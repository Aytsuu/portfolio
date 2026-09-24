import fs from "node:fs";
import path from "node:path";
import { resolvePublicAssetDir } from "./resolve-public-asset-dir";

export interface GalleryImage {
  src: string;
  alt: string;
}

const galleryDir = resolvePublicAssetDir("assets", "gallery");

const toAlt = (fileName: string) =>
  fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

export const loadGalleryImages = (): GalleryImage[] => {
  if (!fs.existsSync(galleryDir)) {
    return [];
  }

  return fs
    .readdirSync(galleryDir)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort()
    .map((file) => ({
      src: `/assets/gallery/${file}`,
      alt: toAlt(file),
    }));
};
