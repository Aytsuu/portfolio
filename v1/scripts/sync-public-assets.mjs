import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(scriptDir, "..");
const publicRoot = path.join(projectRoot, "public");
const outDir = path.join(projectRoot, "src", "generated");
const outFile = path.join(outDir, "public-assets.json");

const assetUrl = (slug, fileName) => `/assets/projects/${slug}/${fileName}`;

const resolveCover = (slug, projectDir, coverFromMeta) => {
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

const toAlt = (fileName) =>
  fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

const loadProjects = () => {
  const assetsProjectsRoot = path.join(publicRoot, "assets", "projects");
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
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

      return {
        slug,
        name: meta.name,
        description: meta.description,
        link: meta.link,
        cover: resolveCover(slug, projectDir, meta.cover),
      };
    });
};

const loadGalleryImages = () => {
  const galleryDir = path.join(publicRoot, "assets", "gallery");
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

const loadCertificateImages = () => {
  const certificatesDir = path.join(publicRoot, "assets", "certificates");
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

const manifest = {
  projects: loadProjects(),
  gallery: loadGalleryImages(),
  certificates: loadCertificateImages(),
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

console.log(
  `sync-public-assets: ${manifest.projects.length} projects, ${manifest.gallery.length} gallery, ${manifest.certificates.length} certificates`,
);
