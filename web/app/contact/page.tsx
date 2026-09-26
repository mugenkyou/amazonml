import Link from "next/link";
import type { Metadata } from "next";
import {
  Mail,
  Github,
  MessageSquare,
  Home,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact & Project Feedback • Amazon ML Challenge Explorer",
  description:
    "Get in touch with the maintainers of Amazon ML Challenge Explorer. Submit feedback, report bugs, or request features via our open GitHub repository.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact & Feedback • Amazon ML Challenge Explorer",
    description:
      "Submit bug reports, feature requests, and dataset questions on GitHub.",
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
    description: "Contact methods and repository issue tracker for Amazon ML Challenge Explorer.",
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
          <span>Open Source Support & Inquiries</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
          Contact & Project Feedback
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368]">
          Have a question about the dataset, encountered a bug, or want to contribute to the open exploration platform?
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6 text-xs sm:text-sm text-[#333333] leading-relaxed">
        {/* GitHub Contact Channel */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#131921] text-white">
                <Github className="h-5 w-5 text-[#FF9900]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                  GitHub Issue Tracker & Discussions
                </h2>
                <p className="text-xs text-[#5F6368] mt-1">
                  The primary communication and feedback channel is our public GitHub repository. You can submit bug reports, dataset normalization suggestions, and feature requests directly.
                </p>
              </div>
            </div>

            <a
              href="https://github.com/mugenkyou/amazonml/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2 font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-all shadow-xs shrink-0"
            >
              <span>Open Issue on GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
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
                How can I correct a misspelled college name or affiliation?
              </h3>
              <p className="text-xs text-[#5F6368]">
                College names are matched through our automated normalization mapping. If you notice an institutional alias that should be mapped to a canonical university profile, please open an issue on GitHub referencing the specific organization slug and team IDs.
              </p>
            </div>

            <div className="rounded-lg bg-[#F7F7F7] border border-[#E3E3E3] p-3.5">
              <h3 className="font-bold text-[#111111] mb-1">
                Is this an official Amazon or Unstop service?
              </h3>
              <p className="text-xs text-[#5F6368]">
                No. This is an independent open-data explorer and research project. For official inquiries, prize claims, or certificates, please contact the organizers directly through the official Unstop competition portal.
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
                or explore our static sitemap at{" "}
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
