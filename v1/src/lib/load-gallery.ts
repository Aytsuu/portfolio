import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface GalleryImage {
  src: string;
  alt: string;
}

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const galleryDir = path.join(moduleDir, "../../public/assets/gallery");

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
