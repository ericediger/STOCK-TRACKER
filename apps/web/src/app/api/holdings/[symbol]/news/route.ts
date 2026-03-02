import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/errors';
import { formatNewsRelativeTime } from '@/lib/format';

// ── Types ────────────────────────────────────────────────────────────

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

// ── GNews API response shape ─────────────────────────────────────────

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

// ── In-memory cache (30 min TTL) ────────────────────────────────────

const CACHE_TTL_MS = 30 * 60 * 1000;

const cache = new Map<string, { data: NewsResponse; cachedAt: number }>();

function getCached(symbol: string): NewsResponse | null {
  const entry = cache.get(symbol);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    cache.delete(symbol);
    return null;
  }
  return entry.data;
}

function setCache(symbol: string, data: NewsResponse): void {
  cache.set(symbol, { data, cachedAt: Date.now() });
}

// ── Helpers ──────────────────────────────────────────────────────────

function truncate(text: string | null | undefined, maxLen: number): string | null {
  if (!text) return null;
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '\u2026';
}

function buildGoogleNewsUrl(name: string): string {
  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date): string => {
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const y = d.getFullYear();
    return `${m}/${day}/${y}`;
  };

  const query = encodeURIComponent(`"${name}"`);
  const dateRange = `cdr:1,cd_min:${formatDate(ninetyDaysAgo)},cd_max:${formatDate(today)}`;
  return `https://www.google.com/search?q=${query}&tbs=${encodeURIComponent(dateRange)}&tbm=nws`;
}

function buildFallbackResponse(name: string, symbol: string): NewsResponse {
  return {
    articles: [
      {
        title: `Search Google News for ${name}`,
        description: null,
        url: buildGoogleNewsUrl(name),
        source: 'Google News',
        publishedAt: null,
        relativeTime: null,
      },
    ],
    fetchedAt: new Date().toISOString(),
    symbol,
  };
}

function normalizeArticle(article: GNewsArticle): NewsArticle {
  return {
    title: article.title,
    description: truncate(article.description, 160),
    url: article.url,
    source: article.source.name,
    publishedAt: article.publishedAt,
    relativeTime: article.publishedAt
      ? formatNewsRelativeTime(article.publishedAt)
      : null,
  };
}

async function fetchGNews(query: string, apiKey: string): Promise<GNewsArticle[]> {
  const now = new Date();
  const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    q: query,
    lang: 'en',
    max: '10',
    from: from.toISOString(),
    to: now.toISOString(),
    apikey: apiKey,
  });

  const res = await fetch(`https://gnews.io/api/v4/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`GNews API returned ${res.status}`);
  }

  const data = (await res.json()) as GNewsResponse;
  return data.articles ?? [];
}

// ── Route handler ────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
): Promise<Response> {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol).toUpperCase();

  // Check cache first
  const cached = getCached(symbol);
  if (cached) {
    return Response.json(cached);
  }

  // Look up instrument
  const instrument = await prisma.instrument.findFirst({
    where: { symbol: { equals: symbol } },
    select: { name: true, symbol: true },
  });

  if (!instrument) {
    return apiError(404, 'NOT_FOUND', `Instrument ${symbol} not found`);
  }

  // Check for API key
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    const fallback = buildFallbackResponse(instrument.name, symbol);
    return Response.json(fallback);
  }

  try {
    // Try with company name first
    let articles = await fetchGNews(`"${instrument.name}" financial`, apiKey);

    // Retry with symbol if no results
    if (articles.length === 0) {
      articles = await fetchGNews(instrument.symbol, apiKey);
    }

    const response: NewsResponse = {
      articles: articles.map(normalizeArticle),
      fetchedAt: new Date().toISOString(),
      symbol,
    };

    setCache(symbol, response);
    return Response.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'News fetch failed';
    return apiError(500, 'INTERNAL_ERROR', message);
  }
}
