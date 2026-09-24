import { getPublicAssetsManifest } from "./public-assets-manifest";
import type { CertificateImage } from "../types/public-assets";

export type { CertificateImage } from "../types/public-assets";

export const loadCertificateImages = (): CertificateImage[] =>
  getPublicAssetsManifest().certificates;
