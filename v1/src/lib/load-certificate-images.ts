import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface CertificateImage {
  src: string;
  alt: string;
}

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const certificatesDir = path.join(moduleDir, "../../public/assets/certificates");

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
