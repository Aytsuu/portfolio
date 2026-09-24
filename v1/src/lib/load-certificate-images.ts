import fs from "node:fs";
import path from "node:path";
import { resolvePublicAssetDir } from "./resolve-public-asset-dir";

export interface CertificateImage {
  src: string;
  alt: string;
}

const certificatesDir = resolvePublicAssetDir("assets", "certificates");

const toAlt = (fileName: string) =>
  fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

export const loadCertificateImages = (): CertificateImage[] => {
  if (!fs.existsSync(certificatesDir)) {
    return [];
  }

  return fs
    .readdirSync(certificatesDir)
    .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
    .sort()
    .map((file) => ({
      src: `/assets/certificates/${encodeURIComponent(file)}`,
      alt: toAlt(file),
    }));
};
