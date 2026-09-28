import { describe, it, expect } from "vitest";
import { getAllBlogPosts, getBlogPostBySlug, getRelatedBlogPosts } from "../lib/blog";

describe("Blog & Editorial System", () => {
  const posts = getAllBlogPosts();

  it("should have at least 8 high-quality editorial articles", () => {
    expect(posts.length).toBeGreaterThanOrEqual(8);
  });

  it("each article should have valid title, slug, content, and metadata", () => {
    posts.forEach((post) => {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.description).toBeTruthy();
      expect(post.publishedDate).toBeTruthy();
      expect(post.author).toBeTruthy();
      expect(post.category).toBeTruthy();
      expect(post.readingTime).toBeTruthy();
      expect(post.content.length).toBeGreaterThan(100);
      expect(post.tags.length).toBeGreaterThan(0);
    });
  });

  it("should retrieve specific post by slug", () => {
    const post = getBlogPostBySlug("amazon-ml-challenge-2026-final-leaderboard");
    expect(post).toBeDefined();
    expect(post?.title).toContain("Final Leaderboard");
  });

  it("should retrieve related articles cleanly", () => {
    const related = getRelatedBlogPosts("amazon-ml-challenge-2026-final-leaderboard", 2);
    expect(related.length).toBe(2);
    expect(related.every((r) => r.slug !== "amazon-ml-challenge-2026-final-leaderboard")).toBe(true);
  });
});
