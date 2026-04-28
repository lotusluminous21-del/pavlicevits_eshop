/**
 * Static catalog of projects featured on the marketing site.
 *
 * The list is intentionally small (per design pack: portfolio is curated,
 * not exhaustive). Each entry maps to a slug-based detail page; only
 * `sithoniaYacht` ships a full case study at launch — others are
 * teasers that share the index card and link back to the index until
 * their case studies are written.
 */
import { projectAssets } from "./project-assets";

export type ProjectCategory =
  | "all"
  | "architectural"
  | "automotive"
  | "marine"
  | "specialty";

export type ProjectSlug =
  | "sithoniaYacht"
  | "halkidikiHotel"
  | "thessalonikiBodyshop"
  | "industrialFloor"
  | "kalamariaApartment"
  | "porticarrasBoats";

export type ProjectCard = {
  slug: ProjectSlug;
  category: Exclude<ProjectCategory, "all">;
  /** Hero photo for the index card AND the detail hero. */
  image: string;
  /** True if a full case study has been written. */
  hasCaseStudy: boolean;
};

export const PROJECTS: readonly ProjectCard[] = [
  {
    slug: "sithoniaYacht",
    category: "marine",
    image: projectAssets.hellenicCoastVan,
    hasCaseStudy: true,
  },
  {
    slug: "halkidikiHotel",
    category: "architectural",
    image: projectAssets.hellenicCoastVan,
    hasCaseStudy: false,
  },
  {
    slug: "thessalonikiBodyshop",
    category: "automotive",
    image: projectAssets.hellenicCoastVan,
    hasCaseStudy: false,
  },
  {
    slug: "industrialFloor",
    category: "specialty",
    image: projectAssets.hellenicCoastVan,
    hasCaseStudy: false,
  },
  {
    slug: "kalamariaApartment",
    category: "architectural",
    image: projectAssets.hellenicCoastVan,
    hasCaseStudy: false,
  },
  {
    slug: "porticarrasBoats",
    category: "marine",
    image: projectAssets.hellenicCoastVan,
    hasCaseStudy: false,
  },
] as const;

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  "all",
  "architectural",
  "automotive",
  "marine",
  "specialty",
] as const;

export function findProject(slug: string): ProjectCard | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
