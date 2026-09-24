import { getPublicAssetsManifest } from "./public-assets-manifest";
import type { GalleryImage } from "../types/public-assets";

export type { GalleryImage } from "../types/public-assets";

export const loadGalleryImages = (): GalleryImage[] =>
  getPublicAssetsManifest().gallery;
