import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryLanding } from "@/components/site/category-landing";
import { landingConfigs } from "@/lib/landings";

type Props = { params: Promise<{ landing: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { landing } = await params;
  const config = landingConfigs[landing];
  if (!config) return { title: "SILHO Medicina Estética" };
  return { title: `${config.title} | SILHO Medicina Estética`, description: config.intro };
}

export default async function LandingPage({ params }: Props) {
  const { landing } = await params;
  const config = landingConfigs[landing];
  if (!config) notFound();
  return <CategoryLanding slug={landing} config={config} />;
}
