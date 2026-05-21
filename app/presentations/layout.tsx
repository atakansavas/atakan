import type { ReactNode } from "react";
import { SubpageShell } from "../../components/SubpageShell";

// Delegates chrome (dark bg, glass nav, mobile pill) to the shared
// SubpageShell so /presentations matches /cv and the homepage.
export default function PresentationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SubpageShell eyebrow="Sunumlar">{children}</SubpageShell>;
}
