/**
 * Static catalog of insights articles. Mirrors `projects-data.ts` —
 * teaser entries on the index, only `antifoulingNorth` ships a full
 * article body at launch (others 404 to avoid empty pages).
 */
export type InsightSlug =
  | "antifoulingNorth"
  | "colorMatchOEM"
  | "industrialFloors"
  | "ecoCertifications"
  | "mediterraneanFacades"
  | "primerSelection";

export type Insight = {
  slug: InsightSlug;
  hasArticle: boolean;
};

export const INSIGHTS: readonly Insight[] = [
  { slug: "antifoulingNorth", hasArticle: true },
  { slug: "colorMatchOEM", hasArticle: false },
  { slug: "industrialFloors", hasArticle: false },
  { slug: "ecoCertifications", hasArticle: false },
  { slug: "mediterraneanFacades", hasArticle: false },
  { slug: "primerSelection", hasArticle: false },
] as const;

export function findInsight(slug: string): Insight | undefined {
  return INSIGHTS.find((p) => p.slug === slug);
}
