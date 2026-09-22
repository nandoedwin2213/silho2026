import { redirect } from "next/navigation";

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/agendar/${slug}`);
}
