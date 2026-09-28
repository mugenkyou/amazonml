import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Calendar, Clock, ArrowRight, Home, Sparkles, Tag, Newspaper } from "lucide-react";
import { getAllBlogPosts } from "@/lib/blog";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, generateWebPageSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog & Competition Insights • Amazon ML Challenge 2026",
  description:
    "Editorial analysis, leaderboard dynamics, college statistics, F1-score mathematical breakdowns, and historical insights from the Amazon ML Challenge 2026.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog & Insights • Amazon ML Challenge 2026 Explorer",
    description:
      "Deep dives into leaderboard movements, college performance rankings, and machine learning competition methodologies.",
    url: `${SITE_URL}/blog`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Insights • Amazon ML Challenge 2026 Explorer",
    description:
      "Deep dives into leaderboard movements, college performance rankings, and machine learning competition methodologies.",
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Blog & Insights", item: "/blog" },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: "Blog & Competition Insights • Amazon ML Challenge 2026",
    description:
      "Editorial analysis, leaderboard dynamics, college statistics, and historical insights from the Amazon ML Challenge 2026.",
    pathname: "/blog",
  });

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="mx-auto max-w-6xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 space-y-6 sm:space-y-8">
      <JsonLd data={[breadcrumbSchema, webPageSchema]} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#767676] flex-wrap">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911] transition-colors">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Blog & Insights</span>
      </nav>

      {/* Hero Header */}
      <header className="rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF9] via-white to-white p-5 sm:p-7 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-2.5 py-0.5 text-xs font-mono font-bold text-[#E47911] uppercase tracking-wider">
            <Newspaper className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>EDITORIAL & ANALYSIS</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
          Competition Insights & Analysis
        </h1>

        <p className="mt-1.5 text-sm sm:text-base font-bold text-[#E47911]">
          Historical articles, leaderboard mechanics, and data science perspectives on Amazon ML Challenge 2026.
        </p>

        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368] max-w-3xl leading-relaxed">
          Explore research notes, university engagement breakdowns, F1 score evaluation mathematics, and checkpoint volatility analysis derived from the preserved competition archives.
        </p>
      </header>

      {/* Featured Article Card */}
      {featuredPost && (
        <section aria-labelledby="featured-heading" className="rounded-xl border border-[#F5C26B] bg-gradient-to-br from-[#FFFDF9] to-[#FFF8ED] p-5 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded bg-[#FF9900] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Featured Analysis
            </span>
            <span className="text-xs font-semibold text-[#767676]">{featuredPost.category}</span>
          </div>

          <h2 id="featured-heading" className="text-xl sm:text-2xl font-bold text-[#111111] hover:text-[#E47911] transition-colors">
            <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
          </h2>

          <p className="mt-2 text-sm text-[#5F6368] leading-relaxed max-w-3xl">
            {featuredPost.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F5E2C4] text-xs text-[#767676]">
            <div className="flex items-center gap-4 flex-wrap font-mono text-[11px]">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#FF9900]" />
                {new Date(featuredPost.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#FF9900]" />
                {featuredPost.readingTime}
              </span>
            </div>

            <Link
              href={`/blog/${featuredPost.slug}`}
              className="inline-flex items-center gap-1.5 font-bold text-xs text-[#111111] bg-white border border-[#E3E3E3] hover:border-[#FF9900] hover:text-[#E47911] px-3.5 py-1.5 rounded-lg shadow-2xs transition-all"
            >
              <span>Read Full Article</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* Article Grid */}
      <section aria-labelledby="all-articles-heading" className="space-y-4">
        <h2 id="all-articles-heading" className="text-sm font-bold uppercase tracking-wider text-[#767676] flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#FF9900]" />
          <span>All Articles ({posts.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {regularPosts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-2xs hover:border-[#FF9900] hover:shadow-xs transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="rounded bg-[#F4F4F4] text-[#5F6368] group-hover:bg-[#FFF3E0] group-hover:text-[#E47911] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors">
                    {post.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#767676] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#111111] group-hover:text-[#E47911] transition-colors leading-snug">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="mt-2 text-xs text-[#5F6368] line-clamp-3 leading-relaxed">
                  {post.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAEAEA] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-[#767676]">
                  {new Date(post.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#007185] group-hover:text-[#E47911] transition-colors"
                >
                  <span>Read</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Internal Navigation Shortcuts */}
      <div className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-[#5F6368]">
          <span className="font-bold text-[#111111]">Looking for raw competition data?</span> Explore verified historical rankings, colleges, and movement analytics.
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link href="/leaderboard" className="px-3 py-1.5 rounded-md border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] font-semibold transition-colors">
            Leaderboard
          </Link>
          <Link href="/movers" className="px-3 py-1.5 rounded-md border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] font-semibold transition-colors">
            Movers
          </Link>
          <Link href="/colleges" className="px-3 py-1.5 rounded-md border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] font-semibold transition-colors">
            Colleges
          </Link>
          <Link href="/statistics" className="px-3 py-1.5 rounded-md border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] font-semibold transition-colors">
            Statistics
          </Link>
        </div>
      </div>
    </div>
  );
}
