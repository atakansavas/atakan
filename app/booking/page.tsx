import { redirect } from "next/navigation";

// /booking now just bounces to WhatsApp — easier than running the old
// AI voice booking flow, and keeps the existing nav / footer links
// pointing somewhere useful.
export const dynamic = "force-static";

export default function BookingPage() {
  redirect("https://wa.me/905352797392");
}
