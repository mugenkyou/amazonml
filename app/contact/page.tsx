import Link from "next/link";
import type { Metadata } from "next";
import {
  MessageSquare,
  Home,
  HelpCircle,
  FileText,
  CheckCircle2,
  ArrowRight,
  Database,
  Layers,
} from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact & Feedback • Amazon ML Challenge Explorer",
  description:
    "Information and support for Amazon ML Challenge Explorer. Find answers to common dataset questions and explore documentation.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact & Feedback • Amazon ML Challenge Explorer",
    description:
      "Platform questions, dataset inquiries, and documentation for Amazon ML Challenge Explorer.",
    url: `${SITE_URL}/contact`,
  },
};

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Contact", item: "/contact" },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: "Contact & Project Feedback",
    description: "Contact methods and guidance for Amazon ML Challenge Explorer.",
    pathname: "/contact",
  });

  return (
    <div className="mx-auto max-w-4xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <JsonLd data={[breadcrumbSchema, webPageSchema]} />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676]">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911]">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Contact & Feedback</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#E3E3E3] pb-4 mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-3 py-0.5 text-xs font-semibold text-[#E47911] mb-2.5">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Platform Support & Inquiries</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
          Contact & Feedback
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368]">
          Have a question about the dataset, methodology, or institutional rankings?
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6 text-xs sm:text-sm text-[#333333] leading-relaxed">
        {/* Resource Guide */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>Platform Documentation & Inquiries</span>
          </h2>
          <p>
            Amazon ML Challenge Explorer is maintained as an independent data analysis tool. For questions regarding the methodology or institutional calculations, please consult our documentation sections:
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/methodology"
              className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3.5 hover:border-[#FF9900] hover:bg-[#FFFDF9] transition-all flex items-start justify-between"
            >
              <div>
                <span className="font-bold text-[#111111] block mb-1">Methodology & Calculations</span>
                <span className="text-[11px] text-[#767676]">Review college ranking formulas and normalization logic.</span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#767676] shrink-0 mt-0.5" />
            </Link>

            <Link
              href="/data-sources"
              className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3.5 hover:border-[#FF9900] hover:bg-[#FFFDF9] transition-all flex items-start justify-between"
            >
              <div>
                <span className="font-bold text-[#111111] block mb-1">Data Sources & Provenance</span>
                <span className="text-[11px] text-[#767676]">Learn about the public leaderboard collection and completeness.</span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#767676] shrink-0 mt-0.5" />
            </Link>
          </div>
        </section>

        {/* Common Inquiries */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3.5 flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-4">
            <div className="rounded-lg bg-[#F7F7F7] border border-[#E3E3E3] p-3.5">
              <h3 className="font-bold text-[#111111] mb-1">
                How are college names and affiliations normalized?
              </h3>
              <p className="text-xs text-[#5F6368]">
                College names are matched through our automated normalization mapping. Names with multiple registration aliases or acronyms are consolidated to produce unified institutional profiles.
              </p>
            </div>

            <div className="rounded-lg bg-[#F7F7F7] border border-[#E3E3E3] p-3.5">
              <h3 className="font-bold text-[#111111] mb-1">
                Is this an official Amazon or Unstop service?
              </h3>
              <p className="text-xs text-[#5F6368]">
                No. This is an independent data exploration and research tool. For official competition inquiries, prize claims, or certificates, please contact the organizers directly through the official Unstop competition portal.
              </p>
            </div>

            <div className="rounded-lg bg-[#F7F7F7] border border-[#E3E3E3] p-3.5">
              <h3 className="font-bold text-[#111111] mb-1">
                Can I access this dataset programmatically?
              </h3>
              <p className="text-xs text-[#5F6368]">
                Yes, you can read our machine-readable guide at{" "}
                <Link href="/llms.txt" className="text-[#007185] hover:text-[#E47911] font-mono hover:underline">
                  /llms.txt
                </Link>{" "}
                or explore our sitemap at{" "}
                <Link href="/sitemap.xml" className="text-[#007185] hover:text-[#E47911] font-mono hover:underline">
                  /sitemap.xml
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
