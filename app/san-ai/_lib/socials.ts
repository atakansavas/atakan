import type { ComponentType } from "react";
import {
  SiFacebook,
  SiInstagram,
  SiLinkedin,
  SiThreads,
  SiTiktok,
  SiYoutube,
} from "react-icons/si";

/**
 * Single source of truth for San·ai's social presence. Handles, links and brand
 * icons live here so the Feed section and the footer never drift apart.
 *
 * Verified against the project's account inventory (docs/02-sosyal-medya) on
 * 2026-07-27 — all accounts are active with their profiles filled in.
 */

type IconCmp = ComponentType<{ size?: number; className?: string }>;

export type SocialKey =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "threads"
  | "facebook"
  | "linkedin";

export type Social = {
  key: SocialKey;
  platform: string;
  /** Display handle — kept brand-consistent (see the TikTok note below). */
  handle: string;
  href: string;
  icon: IconCmp;
};

export const socials: Record<SocialKey, Social> = {
  instagram: {
    key: "instagram",
    platform: "Instagram",
    handle: "@sanai.network",
    href: "https://www.instagram.com/sanai.network/",
    icon: SiInstagram,
  },
  tiktok: {
    key: "tiktok",
    platform: "TikTok",
    // The live profile handle is @sezai.network — a known typo that will be
    // corrected to @sanai.network once TikTok's 30-day handle lock lifts
    // (2026-08-04). We link to the working profile but show the brand handle.
    handle: "@sanai.network",
    href: "https://www.tiktok.com/@sezai.network",
    icon: SiTiktok,
  },
  youtube: {
    key: "youtube",
    platform: "YouTube",
    handle: "@sanai.network",
    href: "https://www.youtube.com/@sanai.network",
    icon: SiYoutube,
  },
  threads: {
    key: "threads",
    platform: "Threads",
    handle: "@sanai.network",
    href: "https://www.threads.com/@sanai.network",
    icon: SiThreads,
  },
  facebook: {
    key: "facebook",
    platform: "Facebook",
    handle: "San·ai Network",
    href: "https://www.facebook.com/profile.php?id=61591440077428",
    icon: SiFacebook,
  },
  linkedin: {
    key: "linkedin",
    platform: "LinkedIn",
    handle: "Atakan Savaş",
    href: "https://www.linkedin.com/in/hiata/",
    icon: SiLinkedin,
  },
};
