"use client";

import { useEffect, useState } from "react";

// ── Types (mirror API response) ──────────────────────────────────────

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string | null;
  relativeTime: string | null;
}

interface NewsResponse {
  articles: NewsArticle[];
  fetchedAt: string;
  symbol: string;
}

// ── Props ────────────────────────────────────────────────────────────

interface NewsSectionProps {
  symbol: string;
  name: string;
}

// ── Component ────────────────────────────────────────────────────────

export function NewsSection({ symbol, name }: NewsSectionProps) {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchNews(): Promise<void> {
      setIsLoading(true);
      setHasError(false);

      try {
        const res = await fetch(
          `/api/holdings/${encodeURIComponent(symbol)}/news`,
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as NewsResponse;
        if (!cancelled) {
          setData(json);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchNews();
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return (
    <section>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-heading text-text-primary">
          Recent News
        </h2>
        <span className="text-xs text-text-tertiary">90 days</span>
      </div>

      {/* Loading */}
      {isLoading && <SkeletonCards />}

      {/* Error */}
      {!isLoading && hasError && (
        <p className="text-sm text-text-secondary">
          News temporarily unavailable.
        </p>
      )}

      {/* Empty */}
      {!isLoading && !hasError && data && data.articles.length === 0 && (
        <p className="text-sm text-text-secondary">
          No recent news found for {name}.
        </p>
      )}

      {/* Loaded */}
      {!isLoading && !hasError && data && data.articles.length > 0 && (
        <div className="bg-bg-secondary rounded-lg border border-border-primary divide-y divide-border-primary/50">
          {data.articles.map((article, idx) => (
            <ArticleCard key={article.url + String(idx)} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Article Card ─────────────────────────────────────────────────────

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 hover:bg-bg-tertiary cursor-pointer transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
    >
      {/* Headline */}
      <p className="text-sm font-medium text-text-primary line-clamp-2">
        {article.title}
      </p>

      {/* Excerpt */}
      {article.description && (
        <p className="text-xs text-text-secondary line-clamp-1 mt-1">
          {article.description}
        </p>
      )}

      {/* Meta line */}
      <div className="flex items-center gap-1.5 mt-2 text-xs text-text-tertiary">
        <span>{article.source}</span>
        {article.relativeTime && (
          <>
            <span>&middot;</span>
            <span>{article.relativeTime}</span>
          </>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-auto shrink-0"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </div>
    </a>
  );
}

// ── Skeleton Cards ───────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <div className="bg-bg-secondary rounded-lg border border-border-primary divide-y divide-border-primary/50">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 space-y-3 motion-safe:animate-pulse">
          <div className="h-4 bg-bg-tertiary rounded w-3/4" />
          <div className="h-3 bg-bg-tertiary rounded w-[55%]" />
          <div className="h-3 bg-bg-tertiary rounded w-[35%]" />
        </div>
      ))}
    </div>
  );
}
