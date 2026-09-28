import Link from "next/link";
import type { Metadata } from "next";
import { Heart, Coffee, Server, Database, Code2, Sparkles, Home, ExternalLink, ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, generateWebPageSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Support Amazon ML Explorer",
  description:
    "Support the development and maintenance of Amazon ML Challenge Explorer, a historical archive and exploration platform for the 2026 competition.",
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    title: "Support Amazon ML Explorer",
    description:
      "Support the development and maintenance of Amazon ML Challenge Explorer, an independent historical competition archive.",
    url: `${SITE_URL}/support`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Support Amazon ML Explorer",
    description:
      "Support the development and maintenance of Amazon ML Challenge Explorer, an independent historical competition archive.",
  },
};

export default function SupportPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Support", item: "/support" },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: "Support Amazon ML Explorer",
    description:
      "Support the development and maintenance of Amazon ML Challenge Explorer, a historical archive and exploration platform for the 2026 competition.",
    pathname: "/support",
  });

  return (
    <div className="mx-auto max-w-3xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 space-y-6 sm:space-y-8">
      <JsonLd data={[breadcrumbSchema, webPageSchema]} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#767676] flex-wrap">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911] transition-colors">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Support</span>
      </nav>

      {/* Hero Header */}
      <header className="rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF9] via-white to-white p-5 sm:p-7 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-2.5 py-0.5 text-xs font-mono font-bold text-[#E47911] uppercase tracking-wider">
            <Heart className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>COMMUNITY SUPPORT</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
          Support Amazon ML Explorer
        </h1>

        <p className="mt-1.5 text-sm sm:text-base font-bold text-[#E47911]">
          Built independently to preserve and explore the Amazon ML Challenge 2026 competition.
        </p>

        <p className="mt-2 text-xs sm:text-sm text-[#5F6368] leading-relaxed">
          Enjoying the Explorer? If it helped you explore the competition, analyze team movements, or study institutional performance, a small contribution helps keep the project running.
        </p>
      </header>

      {/* Main Support Action Card */}
      <section className="rounded-xl border border-[#F5C26B] bg-gradient-to-br from-[#FFFDF9] to-[#FFF8ED] p-5 sm:p-7 shadow-xs space-y-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#111111] flex items-center justify-center sm:justify-start gap-2">
              <Coffee className="h-5 w-5 text-[#FF9900]" />
              <span>Buy us a coffee on Ko-fi</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#5F6368]">
              Directly support independent hosting, database maintenance, and ongoing development.
            </p>
          </div>

          <a
            href="https://ko-fi.com/sachinskyte"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#FF9900] hover:bg-[#E47911] text-black font-extrabold px-6 py-3 text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <span>Support on Ko-fi</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* What Your Support Helps With */}
      <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#767676]">
          What Your Support Helps With
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
          <div className="rounded-lg border border-[#EBEBEB] bg-[#FAFAFA] p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#111111]">
              <Server className="h-4 w-4 text-[#FF9900]" />
              <span>Hosting & Infrastructure</span>
            </div>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Keeping servers, CDN bandwidth, and static hosting fast and reliable for thousands of student visits.
            </p>
          </div>

          <div className="rounded-lg border border-[#EBEBEB] bg-[#FAFAFA] p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#111111]">
              <Database className="h-4 w-4 text-[#FF9900]" />
              <span>Data Collection & Preservation</span>
            </div>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Storing all 17 competition checkpoint snapshots, index maps, and institutional analytics for long-term open access.
            </p>
          </div>

          <div className="rounded-lg border border-[#EBEBEB] bg-[#FAFAFA] p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#111111]">
              <Code2 className="h-4 w-4 text-[#FF9900]" />
              <span>Development & Maintenance</span>
            </div>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Continuous optimization, mobile responsiveness enhancements, and rapid bug fixes for the explorer engine.
            </p>
          </div>

          <div className="rounded-lg border border-[#EBEBEB] bg-[#FAFAFA] p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#111111]">
              <Sparkles className="h-4 w-4 text-[#FF9900]" />
              <span>Future Improvements</span>
            </div>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Adding deeper data science visualizations, team comparison tools, and editorial retrospectives.
            </p>
          </div>
        </div>
      </section>

      {/* Give Feedback Bar */}
      <section className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-[#5F6368] text-center sm:text-left">
          <span className="font-bold text-[#111111]">Have suggestions or feature ideas?</span> We value your feedback on how to make the explorer better.
        </div>
        <a
          href="https://tally.so/r/A71rkk"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-lg border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] font-semibold transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          <span>Give Feedback</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </section>
    </div>
  );
}
