export interface Project {
  slug: string;
  name: string;
  description: string;
  link?: string;
  cover: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface CertificateImage {
  src: string;
  alt: string;
}

export interface PublicAssetsManifest {
  projects: Project[];
  gallery: GalleryImage[];
  certificates: CertificateImage[];
}
