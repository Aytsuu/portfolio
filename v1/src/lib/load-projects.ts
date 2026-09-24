import fs from "node:fs";
import path from "node:path";
import { resolvePublicAssetDir } from "./resolve-public-asset-dir";

export interface Project {
  slug: string;
  name: string;
  description: string;
  link?: string;
  cover: string;
}

interface ProjectMetaFile {
  name: string;
  description: string;
  link?: string;
  cover?: string;
}

const assetsProjectsRoot = resolvePublicAssetDir("assets", "projects");

const assetUrl = (slug: string, fileName: string) =>
  `/assets/projects/${slug}/${fileName}`;

const resolveCover = (
  slug: string,
  projectDir: string,
  coverFromMeta?: string,
): string => {
  if (coverFromMeta) {
    const fileName = coverFromMeta.includes("/")
      ? path.basename(coverFromMeta)
      : coverFromMeta;
    if (fs.existsSync(path.join(projectDir, fileName))) {
      return assetUrl(slug, fileName);
    }
  }

  const candidates = [
    "cover.png",
    "cover.webp",
    "cover.jpg",
    "cover.jpeg",
    "cover.svg",
  ];

  for (const file of candidates) {
    if (fs.existsSync(path.join(projectDir, file))) {
      return assetUrl(slug, file);
    }
  }

  const imageFile = fs
    .readdirSync(projectDir)
    .find((file) => /\.(png|jpe?g|webp|svg)$/i.test(file));

  if (imageFile) {
    return assetUrl(slug, imageFile);
  }

  return assetUrl(slug, "cover.svg");
};

export const loadProjects = (): Project[] => {
  if (!fs.existsSync(assetsProjectsRoot)) {
    return [];
  }

  return fs
    .readdirSync(assetsProjectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) =>
      fs.existsSync(path.join(assetsProjectsRoot, slug, "meta.json")),
    )
    .sort()
    .map((slug) => {
      const projectDir = path.join(assetsProjectsRoot, slug);
      const metaPath = path.join(projectDir, "meta.json");
      const raw = fs.readFileSync(metaPath, "utf-8");
      const meta = JSON.parse(raw) as ProjectMetaFile;

      return {
        slug,
        name: meta.name,
        description: meta.description,
        link: meta.link,
        cover: resolveCover(slug, projectDir, meta.cover),
      };
    });
};
