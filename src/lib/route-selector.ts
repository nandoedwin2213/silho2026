import type { RouteSlug } from "./routes";

export type RouteSelectorAnswers = {
  concern?: string;
  conditions?: string[];
  zone?: string;
  previous?: string;
  city?: string;
};

export type RouteRecommendation = {
  slug: RouteSlug;
  note?: string;
};

export function recommendRoute(answers: RouteSelectorAnswers): RouteRecommendation {
  const concern = answers.concern?.toLowerCase() ?? "";
  const conditions = (answers.conditions ?? []).map((value) => value.toLowerCase());
  const activeAcne = concern.includes("acné") || concern.includes("acne") || conditions.some((value) => value.includes("acné") || value.includes("acne"));
  const scars = concern.includes("cicatr") || concern.includes("marca") || conditions.some((value) => value.includes("cicatr") || value.includes("marca"));

  if (activeAcne) {
    return scars ? { slug: "acne", note: "Primero controlamos el acné activo antes de tratar las marcas." } : { slug: "acne" };
  }
  if (scars) return { slug: "cicatrices-acne" };
  return { slug: "rejuvenecimiento-facial" };
}
