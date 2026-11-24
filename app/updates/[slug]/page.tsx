import { notFound, redirect } from "next/navigation";
import { updates } from "@/lib/content";

export function generateStaticParams() {
  return updates.map(update => ({ slug: update.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!updates.some(update => update.slug === slug)) notFound();
  redirect(`/updates/#${slug}`);
}
