"use client";

import Link from "next/link";
import { ShieldCheck, Cookie, Home, SlidersHorizontal, Lock, CheckCircle2 } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export default function PrivacyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Privacy Policy", item: "/privacy" },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: "Privacy Policy • Amazon ML Challenge Explorer",
    description:
      "Privacy policy explaining data collection, consent management, and analytics on Amazon ML Challenge Explorer.",
    pathname: "/privacy",
  });

  const handleOpenPreferences = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-consent-preferences"));
    }
  };

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
        <span className="font-semibold text-[#111111]">Privacy Policy</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#E3E3E3] pb-4 mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF3] border border-[#A6F4C5] px-3 py-0.5 text-xs font-semibold text-[#067D62] mb-2.5">
          <Lock className="h-3.5 w-3.5" />
          <span>Privacy & Data Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
          Privacy Policy
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368]">
          Last Updated: September 2026 • Transparent disclosure regarding data usage and analytics consent.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6 text-xs sm:text-sm text-[#333333] leading-relaxed">
        {/* Consent Controls Box */}
        <section className="rounded-xl border border-[#F5C26B] bg-[#FFFDF9] p-5 sm:p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#111111] flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-[#FF9900]" />
              <span>Your Analytics Consent Status</span>
            </h2>
            <p className="text-xs text-[#5F6368] mt-1">
              You can review, modify, or revoke your aggregate analytics consent at any time.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenPreferences}
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2 font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Manage Preferences</span>
          </button>
        </section>

        {/* 1. What We Collect */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>1. Information We Do Not Collect</span>
          </h2>
          <p>
            Amazon ML Challenge Explorer is a static data exploration utility. We respect user privacy by design:
          </p>
          <ul className="mt-2.5 space-y-1.5 list-disc list-inside text-[#5F6368]">
            <li><strong>No User Accounts:</strong> We do not require registration, login, passwords, email addresses, or phone numbers.</li>
            <li><strong>No Financial Data:</strong> The platform is completely free and collects no payment or billing details.</li>
            <li><strong>No Form Submissions:</strong> We do not store or transmit submitted search queries to third-party databases.</li>
          </ul>
        </section>

        {/* 2. Public Competition Data */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>2. Public Competition Dataset</span>
          </h2>
          <p>
            The leaderboard standings, team names, participant names, and college affiliations displayed on this site are derived exclusively from the <strong>public contest leaderboard</strong> made available during the official Amazon ML Challenge 2026. This information was publicly broadcasted as part of the competition.
          </p>
        </section>

        {/* 3. Analytics & Cookies */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <Cookie className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>3. Analytics & Local Storage</span>
          </h2>
          <p>
            We use Google Analytics 4 strictly to understand aggregate visitor trends (e.g., total daily visits, popular college leaderboard views, and device types):
          </p>
          <ul className="mt-2.5 space-y-1.5 list-disc list-inside text-[#5F6368]">
            <li><strong>Consent Mode Default:</strong> By default, analytics tracking is kept in a denied state until explicit consent is provided.</li>
            <li><strong>IP Anonymization:</strong> IP addresses are anonymized automatically.</li>
            <li><strong>Local Storage:</strong> We use your browser&apos;s local storage exclusively to save your consent choice (<code>amz_ml_analytics_consent</code>) and avoid repeatedly displaying the consent banner.</li>
          </ul>
        </section>

        {/* 4. Contact for Inquiries */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-2.5">
            4. Questions & Privacy Requests
          </h2>
          <p className="text-[#5F6368]">
            If you have questions about this privacy notice or dataset representation, please visit our{" "}
            <Link href="/contact" className="text-[#007185] hover:text-[#E47911] hover:underline font-medium">
              Contact & Feedback Page
            </Link>{" "}
            or open an issue on GitHub.
          </p>
        </section>
      </div>
    </div>
  );
}
