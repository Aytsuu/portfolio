import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves a folder under `public/` at build time.
 * Cloudflare prerender bundles may not provide `import.meta.url`.
 */
export const resolvePublicAssetDir = (...segments: string[]): string => {
  const candidates: string[] = [];
  const cwd = process.cwd();

  candidates.push(path.join(cwd, "public", ...segments));
  candidates.push(path.join(cwd, "v1", "public", ...segments));

  const metaUrl = import.meta.url;
  if (typeof metaUrl === "string" && metaUrl.length > 0) {
    const moduleDir = path.dirname(fileURLToPath(metaUrl));
    candidates.push(path.join(moduleDir, "..", "..", "public", ...segments));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return path.normalize(candidate);
    }
  }

  return path.normalize(candidates[0]);
};
