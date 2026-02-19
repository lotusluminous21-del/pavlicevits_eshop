import { getProducts } from '@/lib/shopify/client';
import { ProductGrid } from '@/components/product/product-grid';
import { HeroSection } from '@/components/home/hero-section';
import { CategoryGrid } from '@/components/home/category-grid';

export const metadata = {
  title: 'Pavlicevits | Χρώματα Αυτοκινήτου & Ειδικές Κατασκευές',
  description: 'Η κορυφαία επιλογή για χρώματα αυτοκινήτου, βερνίκια, αστάρια και εργαλεία βαφής.',
  openGraph: {
    type: 'website'
  }
};

export default async function Home() {
  const products = await getProducts({ sortKey: 'CREATED_AT', reverse: true });

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      <section className="py-24 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 border-b-2 border-primary pb-4">
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-black text-muted-foreground/20 leading-none">01</span>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">New Arrivals</h2>
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider mt-1">
                Fresh Inventory / Ref: {new Date().getFullYear()}
              </p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-xs font-mono text-muted-foreground">[ STATUS: ACTIVE ]</span>
          </div>
        </div>

        <ProductGrid products={products} />

        <div className="mt-12 flex justify-center">
          <div className="h-1 w-24 bg-primary/20"></div>
        </div>

        <div className="mt-24 mb-12 border-b-2 border-primary pb-4 flex flex-col md:flex-row items-baseline justify-between">
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-black text-muted-foreground/20 leading-none">02</span>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">Categories</h2>
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider mt-1">
                System Modules / Select Sector
              </p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-xs font-mono text-muted-foreground">[ INDEX: ALL ]</span>
          </div>
        </div>

        <CategoryGrid />
      </section>
    </div>
  );
}
