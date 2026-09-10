import { HomeHero } from "../components/home-hero";
import {
  BuilderSection,
  CatalogStats,
  CategorySection,
  FeaturedSection,
  TrustSection,
} from "../components/home-sections";

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <CatalogStats />
      <FeaturedSection />
      <CategorySection />
      <TrustSection />
      <BuilderSection />
    </main>
  );
}
