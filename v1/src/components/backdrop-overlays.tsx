import type { ReactNode } from "react";
import { BlurBackdrop } from "@/components/blur-backdrop";
import type { CertificateImage, GalleryImage } from "@/types/public-assets";
import { ExperienceReceipt } from "@/components/experience-receipt";

interface BackdropImage {
  src: string;
  alt: string;
}

function BackdropImageGrid({
  images,
  emptyLabel,
}: {
  images: BackdropImage[];
  emptyLabel: string;
}) {
  if (images.length === 0) {
    return (
      <p className="backdrop-empty" role="status">{emptyLabel}</p>
    );
  }

  return (
    <ul className="gallery-overlay-grid">
      {images.map((image) => (
        <li key={image.src} className="gallery-overlay-item">
          <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
        </li>
      ))}
    </ul>
  );
}
interface ExperienceEntry {
  title: string;
  experiencedAt: string;
  year: string;
  location?: string;
  highlights?: string[];
  category?: "education" | "work";
}

interface TestimonialEntry {
  testimonial: string;
  name: string;
  company: string;
  imageURI: string;
}

interface OverlayShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  titleId: string;
  children: ReactNode;
}

function OverlayShell({
  open,
  onClose,
  title,
  closeLabel,
  titleId,
  children,
}: OverlayShellProps) {
  return (
    <BlurBackdrop
      open={open}
      onClose={onClose}
      bare
      showCloseButton
      closeLabel={closeLabel}
      labelledBy={titleId}
    >
      <h2 id={titleId} className="sr-only">{title}</h2>
      <div className="backdrop-section">{children}</div>
    </BlurBackdrop>
  );
}

interface GalleryOverlayProps {
  open: boolean;
  onClose: () => void;
  images: GalleryImage[];
}

export function GalleryOverlay({ open, onClose, images }: GalleryOverlayProps) {
  return (
    <OverlayShell
      open={open}
      onClose={onClose}
      title="Gallery"
      closeLabel="Close gallery"
      titleId="gallery-overlay-title"
    >
      <BackdropImageGrid images={images} emptyLabel="No gallery images yet." />
    </OverlayShell>
  );
}

interface ExperienceOverlayProps {
  open: boolean;
  onClose: () => void;
  experiences: ExperienceEntry[];
}

export function ExperienceOverlay({
  open,
  onClose,
  experiences,
}: ExperienceOverlayProps) {
  return (
    <OverlayShell
      open={open}
      onClose={onClose}
      title="Experience"
      closeLabel="Close experience"
      titleId="experience-overlay-title"
    >
      <ExperienceReceipt experiences={experiences} />
    </OverlayShell>
  );
}

interface CertificatesOverlayProps {
  open: boolean;
  onClose: () => void;
  images: CertificateImage[];
}

export function CertificatesOverlay({
  open,
  onClose,
  images,
}: CertificatesOverlayProps) {
  return (
    <OverlayShell
      open={open}
      onClose={onClose}
      title="Certificates"
      closeLabel="Close certificates"
      titleId="certificates-overlay-title"
    >
      <BackdropImageGrid
        images={images}
        emptyLabel="No certificate images yet."
      />
    </OverlayShell>
  );
}

interface RecommendationsOverlayProps {
  open: boolean;
  onClose: () => void;
  testimonials: TestimonialEntry[];
}

export function RecommendationsOverlay({
  open,
  onClose,
  testimonials,
}: RecommendationsOverlayProps) {
  return (
    <OverlayShell
      open={open}
      onClose={onClose}
      title="Recommendations"
      closeLabel="Close recommendations"
      titleId="recommendations-overlay-title"
    >
      <ul className="recommendation-cards">
        {testimonials.map((item) => (
          <li key={item.name}>
            <article className="recommendation-card">
              <blockquote className="recommendation-card-quote">
                {item.testimonial}
              </blockquote>
              <footer className="recommendation-card-author">
                <img
                  src={item.imageURI}
                  alt=""
                  className="recommendation-card-avatar"
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                />
                <div className="recommendation-card-author-copy">
                  <p className="recommendation-card-name">{item.name}</p>
                  <p className="recommendation-card-company">{item.company}</p>
                </div>
              </footer>
            </article>
          </li>
        ))}
      </ul>
    </OverlayShell>
  );
}
