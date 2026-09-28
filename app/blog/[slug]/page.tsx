import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Home,
  BookOpen,
  Tag,
  Share2,
  TrendingUp,
  Award,
  Building2,
  Layers,
} from "lucide-react";
import { getAllBlogPosts, getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/blog";
import { JsonLd } from "@/components/json-ld";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  getCanonicalUrl,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found • Amazon ML Challenge Explorer",
    };
  }

  const canonicalUrl = getCanonicalUrl(`/blog/${post.slug}`);

  return {
    title: `${post.title} • Amazon ML Challenge Explorer`,
    description: post.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.title} • Amazon ML Challenge 2026`,
      description: post.description,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.publishedDate,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} • Amazon ML Challenge 2026`,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(post.slug, 2);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Blog", item: "/blog" },
    { name: post.title, item: `/blog/${post.slug}` },
  ]);

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.description,
    slug: post.slug,
    publishedDate: post.publishedDate,
    updatedDate: post.updatedDate,
    author: post.author,
    category: post.category,
  });

  return (
    <div className="mx-auto max-w-4xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 space-y-6">
      <JsonLd data={[breadcrumbSchema, articleSchema]} />

      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#767676] flex-wrap">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911] transition-colors">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-[#E47911] transition-colors">
          Blog
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111] truncate max-w-xs">{post.title}</span>
      </nav>

      {/* Back Button */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007185] hover:text-[#E47911] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Articles</span>
        </Link>
      </div>

      {/* Main Article Card */}
      <article className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-8 shadow-xs space-y-6">
        {/* Article Header */}
        <header className="space-y-3 pb-6 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B] px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-xs font-mono text-[#767676] flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#FF9900]" />
              {post.readingTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111111] leading-tight tracking-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-[#5F6368] leading-relaxed">
            {post.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#767676] font-mono">
            <div className="flex items-center gap-2">
              <span className="font-sans font-medium text-[#111111]">{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#FF9900]" />
              <span>
                Published:{" "}
                {new Date(post.publishedDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-[#2D3748] space-y-4">
          {post.content.split("\n\n").map((block, idx) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith("## ")) {
              return (
                <h2
                  key={idx}
                  className="text-lg sm:text-xl font-bold text-[#111111] pt-4 pb-1 border-b border-[#F0F0F0]"
                >
                  {trimmed.replace("## ", "")}
                </h2>
              );
            }

            if (trimmed.startsWith("### ")) {
              return (
                <h3 key={idx} className="text-base sm:text-lg font-bold text-[#111111] pt-2">
                  {trimmed.replace("### ", "")}
                </h3>
              );
            }

            if (trimmed.startsWith("- ")) {
              const items = trimmed.split("\n").map((line) => line.replace(/^- /, "").trim());
              return (
                <ul key={idx} className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#374151]">
                  {items.map((item, iIdx) => (
                    <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                  ))}
                </ul>
              );
            }

            if (trimmed.startsWith("1. ")) {
              const items = trimmed.split("\n").map((line) => line.replace(/^\d+\.\s*/, "").trim());
              return (
                <ol key={idx} className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-[#374151]">
                  {items.map((item, iIdx) => (
                    <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                  ))}
                </ol>
              );
            }

            return (
              <p
                key={idx}
                className="text-xs sm:text-sm text-[#374151] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
              />
            );
          })}
        </div>

        {/* Article Tags */}
        <div className="pt-4 border-t border-[#EAEAEA] flex items-center gap-1.5 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-[#767676]" />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-[#F4F4F4] text-[#5F6368] px-2 py-0.5 text-[11px] font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </article>

      {/* Related Explorations Section */}
      {relatedPosts.length > 0 && (
        <section aria-labelledby="related-heading" className="space-y-3">
          <h2 id="related-heading" className="text-xs font-bold uppercase tracking-wider text-[#767676] flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>Related Insights & Articles</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {relatedPosts.map((rPost) => (
              <Link
                key={rPost.slug}
                href={`/blog/${rPost.slug}`}
                className="block rounded-xl border border-[#E3E3E3] bg-white p-4 shadow-2xs hover:border-[#FF9900] transition-all group"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#767676] mb-1.5">
                  <span className="uppercase text-[#E47911] font-bold">{rPost.category}</span>
                  <span>{rPost.readingTime}</span>
                </div>
                <h3 className="text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors line-clamp-2">
                  {rPost.title}
                </h3>
                <p className="mt-1 text-xs text-[#5F6368] line-clamp-2">
                  {rPost.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Explorer Jump Bar */}
      <div className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-[#5F6368]">
          Continue exploring the Amazon ML Challenge 2026 archive:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/leaderboard"
            className="px-3 py-1.5 rounded-md border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] font-semibold transition-colors"
          >
            Final Leaderboard
          </Link>
          <Link
            href="/movers"
            className="px-3 py-1.5 rounded-md border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] font-semibold transition-colors"
          >
            Movers Dashboard
          </Link>
          <Link
            href="/colleges"
            className="px-3 py-1.5 rounded-md border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] font-semibold transition-colors"
          >
            Colleges
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#007185] hover:text-[#E47911] underline font-medium">$1</a>');
}
