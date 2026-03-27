import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Prisma mock ──────────────────────────────────────────────────────

const mockPrismaClient = vi.hoisted(() => ({
  instrument: {
    findFirst: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
}));

// ── Global fetch mock ────────────────────────────────────────────────

const fetchMock = vi.hoisted(() => vi.fn());
vi.stubGlobal('fetch', fetchMock);

// ── Import route AFTER mocks ─────────────────────────────────────────

import { GET } from '@/app/api/holdings/[symbol]/news/route';
import { NextRequest } from 'next/server';

// ── Helpers ──────────────────────────────────────────────────────────

function makeRequest(symbol: string): NextRequest {
  return new NextRequest(
    `http://localhost:3000/api/holdings/${encodeURIComponent(symbol)}/news`,
  );
}

function makeParams(symbol: string): { params: Promise<{ symbol: string }> } {
  return { params: Promise.resolve({ symbol }) };
}

function gnewsResponse(articles: unknown[] = []) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ totalArticles: articles.length, articles }),
  } as unknown as Response;
}

function gnewsArticle(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Test Headline',
    description: 'Test description for the article that should be included.',
    url: 'https://example.com/article',
    publishedAt: '2026-02-25T10:00:00Z',
    source: { name: 'Test Source' },
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────

describe('GET /api/holdings/[symbol]/news', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...ORIGINAL_ENV, GNEWS_API_KEY: 'test-key' };

    // Clear the module-level cache between tests by re-importing
    // Since we can't directly clear the cache, we reset mocks to ensure
    // each test gets a fresh state. The cache uses symbol as key, so
    // we vary the symbol or handle cache behavior explicitly.
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns 404 when instrument is not found', async () => {
    mockPrismaClient.instrument.findFirst.mockResolvedValue(null);

    const res = await GET(makeRequest('INVALID'), makeParams('INVALID'));

    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('NOT_FOUND');
  });

  it('returns articles on success', async () => {
    mockPrismaClient.instrument.findFirst.mockResolvedValue({
      name: 'Apple Inc.',
      symbol: 'AAPL',
    });

    fetchMock.mockResolvedValueOnce(
      gnewsResponse([gnewsArticle(), gnewsArticle({ title: 'Second Article' })]),
    );

    const res = await GET(makeRequest('AAPL'), makeParams('AAPL'));

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      articles: Array<{ title: string; description: string | null; source: string; relativeTime: string | null }>;
      symbol: string;
      fetchedAt: string;
    };
    expect(body.symbol).toBe('AAPL');
    expect(body.articles).toHaveLength(2);
    expect(body.articles[0]?.title).toBe('Test Headline');
    expect(body.articles[0]?.source).toBe('Test Source');
    expect(body.articles[0]?.relativeTime).toBeTruthy();
    expect(body.fetchedAt).toBeTruthy();
  });

  it('retries with symbol when company name returns zero results', async () => {
    mockPrismaClient.instrument.findFirst.mockResolvedValue({
      name: 'Obscure Corp',
      symbol: 'OBSC',
    });

    // First call (with company name) returns empty
    fetchMock.mockResolvedValueOnce(gnewsResponse([]));
    // Second call (with symbol) returns articles
    fetchMock.mockResolvedValueOnce(gnewsResponse([gnewsArticle({ title: 'Symbol Match' })]));

    const res = await GET(makeRequest('OBSC'), makeParams('OBSC'));

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const body = (await res.json()) as { articles: Array<{ title: string }> };
    expect(body.articles).toHaveLength(1);
    expect(body.articles[0]?.title).toBe('Symbol Match');
  });

  it('returns empty articles when both queries return zero results', async () => {
    mockPrismaClient.instrument.findFirst.mockResolvedValue({
      name: 'Tiny Corp',
      symbol: 'TINY',
    });

    fetchMock.mockResolvedValue(gnewsResponse([]));

    const res = await GET(makeRequest('TINY'), makeParams('TINY'));

    expect(res.status).toBe(200);
    const body = (await res.json()) as { articles: unknown[] };
    expect(body.articles).toHaveLength(0);
  });

  it('returns fallback Google News link when API key is absent', async () => {
    delete process.env.GNEWS_API_KEY;

    mockPrismaClient.instrument.findFirst.mockResolvedValue({
      name: 'Apple Inc.',
      symbol: 'FBCK',
    });

    const res = await GET(makeRequest('FBCK'), makeParams('FBCK'));

    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    const body = (await res.json()) as {
      articles: Array<{ title: string; source: string; url: string; publishedAt: string | null }>;
    };
    expect(body.articles).toHaveLength(1);
    expect(body.articles[0]?.title).toBe('Search Google News for Apple Inc.');
    expect(body.articles[0]?.source).toBe('Google News');
    expect(body.articles[0]?.url).toContain('google.com/search');
    expect(body.articles[0]?.publishedAt).toBeNull();
  });

  it('returns 500 on fetch error', async () => {
    mockPrismaClient.instrument.findFirst.mockResolvedValue({
      name: 'Error Corp',
      symbol: 'ERRR',
    });

    fetchMock.mockRejectedValueOnce(new Error('Network failure'));

    const res = await GET(makeRequest('ERRR'), makeParams('ERRR'));

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('INTERNAL_ERROR');
    expect(body.message).toBe('Network failure');
  });

  it('truncates description to 160 characters', async () => {
    mockPrismaClient.instrument.findFirst.mockResolvedValue({
      name: 'Long Corp',
      symbol: 'LONG',
    });

    const longDesc = 'A'.repeat(200);
    fetchMock.mockResolvedValueOnce(
      gnewsResponse([gnewsArticle({ description: longDesc })]),
    );

    const res = await GET(makeRequest('LONG'), makeParams('LONG'));
    const body = (await res.json()) as { articles: Array<{ description: string }> };
    expect(body.articles[0]?.description).toHaveLength(160);
    expect(body.articles[0]?.description?.endsWith('\u2026')).toBe(true);
  });

  it('handles case-insensitive symbol lookup', async () => {
    mockPrismaClient.instrument.findFirst.mockResolvedValue({
      name: 'Apple Inc.',
      symbol: 'CSYM',
    });

    fetchMock.mockResolvedValueOnce(gnewsResponse([gnewsArticle()]));

    const res = await GET(makeRequest('csym'), makeParams('csym'));

    expect(res.status).toBe(200);
    expect(mockPrismaClient.instrument.findFirst).toHaveBeenCalledWith({
      where: { symbol: { equals: 'CSYM' } },
      select: { name: true, symbol: true },
    });
  });
});
