export type SocialIcon =
  | "github"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "email"
  | "contact";

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
  external?: boolean;
}

export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/Aytsuu",
    icon: "github",
    external: true,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/aytsuu_/",
    icon: "instagram",
    external: true,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/Mrshak8/",
    icon: "facebook",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/paolo-araneta-65b332336/",
    icon: "linkedin",
    external: true,
  },
  {
    label: "Email",
    href: "mailto:paoloaraneta008@gmail.com",
    icon: "email",
  },
  {
    label: "Contact",
    href: "tel:+639262355926",
    icon: "contact",
  },
];
