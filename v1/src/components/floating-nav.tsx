import { useState } from "react";
import {
  CertificatesOverlay,
  ExperienceOverlay,
  GalleryOverlay,
  RecommendationsOverlay,
} from "@/components/backdrop-overlays";
import type { CertificateImage } from "@/lib/load-certificate-images";
import type { GalleryImage } from "@/lib/load-gallery";

type OverlayId =
  | "experience"
  | "certificates"
  | "gallery"
  | "recommendations";

const navItems: { id: OverlayId; label: string; iconSrc: string }[] = [
  { id: "experience", label: "Experience", iconSrc: "/assets/icons/experience.svg" },
  {
    id: "certificates",
    label: "Certificates",
    iconSrc: "/assets/icons/certificate.svg",
  },
  { id: "gallery", label: "Gallery", iconSrc: "/assets/icons/gallery.svg" },
  {
    id: "recommendations",
    label: "Recommendations",
    iconSrc: "/assets/icons/recommendation.svg",
  },
];

interface ExperienceEntry {
  title: string;
  experiencedAt: string;
  year: string;
  location?: string;
  highlights?: string[];
}

interface TestimonialEntry {
  testimonial: string;
  name: string;
  company: string;
  imageURI: string;
}

interface FloatingNavProps {
  galleryImages: GalleryImage[];
  experiences: ExperienceEntry[];
  certificateImages: CertificateImage[];
  testimonials: TestimonialEntry[];
}

export function FloatingNav({
  galleryImages,
  experiences,
  certificateImages,
  testimonials,
}: FloatingNavProps) {
  const [activeOverlay, setActiveOverlay] = useState<OverlayId | null>(null);

  const close = () => setActiveOverlay(null);

  return (
    <>
      <nav className="floating-nav" aria-label="Quick navigation">
        <ul className="floating-nav-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="floating-nav-link"
                aria-label={item.label}
                aria-expanded={activeOverlay === item.id}
                onClick={() => setActiveOverlay(item.id)}
              >
                <img
                  className="floating-nav-icon"
                  src={item.iconSrc}
                  alt=""
                  width={20}
                  height={20}
                  decoding="async"
                />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <ExperienceOverlay
        open={activeOverlay === "experience"}
        onClose={close}
        experiences={experiences}
      />
      <CertificatesOverlay
        open={activeOverlay === "certificates"}
        onClose={close}
        images={certificateImages}
      />
      <GalleryOverlay
        open={activeOverlay === "gallery"}
        onClose={close}
        images={galleryImages}
      />
      <RecommendationsOverlay
        open={activeOverlay === "recommendations"}
        onClose={close}
        testimonials={testimonials}
      />
    </>
  );
}
