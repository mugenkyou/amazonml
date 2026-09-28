import Link from "next/link";
import type { Metadata } from "next";
import { Scale, ShieldCheck, Home, FileText, ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Use • Amazon ML Challenge Explorer",
  description:
    "Terms of use and disclaimer for the Amazon ML Challenge Explorer informational data platform.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Use • Amazon ML Challenge Explorer",
    description:
      "Review the terms of use and conditions for exploring the competition dataset.",
    url: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Terms of Use", item: "/terms" },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: "Terms of Use",
    description: "Terms and conditions for Amazon ML Challenge Explorer.",
    pathname: "/terms",
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
        <span className="font-semibold text-[#111111]">Terms of Use</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#E3E3E3] pb-4 mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-3 py-0.5 text-xs font-semibold text-[#E47911] mb-2.5">
          <Scale className="h-3.5 w-3.5" />
          <span>Terms & Conditions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
          Terms of Use
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368]">
          Last Updated: September 2026 • Please review the conditions of using this informational exploration tool.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6 text-xs sm:text-sm text-[#333333] leading-relaxed">
        {/* 1. Informational Purpose */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>1. Informational & Educational Scope</span>
          </h2>
          <p>
            Amazon ML Challenge Explorer is provided free of charge strictly for educational, historical analysis, and research exploration purposes. The rankings, institutional aggregates, and cross-college groupings are derived from a frozen competition dataset snapshot and do not constitute official prize determinations or certifications.
          </p>
        </section>

        {/* 2. Acceptable Use */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>2. Acceptable Use</span>
          </h2>
          <p>
            You agree to use this platform in accordance with applicable laws and web etiquette:
          </p>
          <ul className="mt-2.5 space-y-1.5 list-disc list-inside text-[#5F6368]">
            <li>Do not attempt to disrupt, overload, or execute denial-of-service attacks against the application.</li>
            <li>Do not attempt to reverse engineer or harvest personal information for spam or abusive marketing campaigns.</li>
            <li>Respect the academic and student communities represented in the dataset.</li>
          </ul>
        </section>

        {/* 3. Disclaimer of Affiliation */}
        <section className="rounded-xl border border-[#F5C26B] bg-[#FFFDF9] p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-2.5">
            3. Disclaimer of Affiliation & Trademarks
          </h2>
          <p className="text-xs text-[#5F6368] leading-relaxed">
            This platform is an independent third-party tool. It is not affiliated with, authorized by, endorsed by, or in any way officially connected with Amazon.com, Inc., Unstop, or any of their subsidiaries or affiliates. All product names, logos, and brands are property of their respective owners.
          </p>
        </section>

        {/* 4. Limitation of Liability */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-2.5">
            4. Limitation of Liability
          </h2>
          <p className="text-[#5F6368]">
            The platform and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. The maintainers are not liable for any errors, omissions, or decisions made in reliance upon the analytics presented on this site.
          </p>
        </section>

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/privacy"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-3.5 py-1.5 font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-all shadow-xs"
          >
            <span>Privacy Policy</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-1.5 font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-all shadow-xs"
          >
            <span>Contact & Inquiries</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
