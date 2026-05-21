import type {
  ApiResult,
  BerwarnaResponse,
  ChapterDetail,
  ComicDetail,
  GenreAllItem,
  GenreDetailResponse,
  GenreRekomendasiItem,
  PopulerResponse,
  PustakaResponse,
  RekomendasiItem,
  SearchResponse,
  TerbaruItem,
} from "@/types/comic";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://komiku-rest-api.vercel.app";

function joinUrl(endpoint: string) {
  return `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

async function fetcher<T>(endpoint: string, revalidate = 300): Promise<T> {
  const res = await fetch(joinUrl(endpoint), {
    next: { revalidate },
  });

  if (!res.ok) {
    let detail = "";
    try {
      const json = await res.json();
      detail = json?.message || json?.error || json?.detail || "";
    } catch {
      detail = res.statusText;
    }
    throw new Error(detail || `API merespons ${res.status}`);
  }

  return res.json() as Promise<T>;
}

async function safeApi<T>(
  request: () => Promise<T>,
  fallback: T
): Promise<ApiResult<T>> {
  try {
    const data = await request();
    return { data, error: null };
  } catch (error) {
    return {
      data: fallback,
      error: error instanceof Error ? error.message : "Gagal mengambil data.",
    };
  }
}

export async function fetchLatestComics() {
  return safeApi<TerbaruItem[]>(
    async () => {
      const data = await fetcher<TerbaruItem[]>("/terbaru", 120);
      return Array.isArray(data) ? data : [];
    },
    []
  );
}

export async function fetchPopularComics() {
  return safeApi<PopulerResponse>(
    () => fetcher<PopulerResponse>("/komik-populer", 300),
    {}
  );
}

export async function fetchRecommendations() {
  return safeApi<RekomendasiItem[]>(
    async () => {
      const data = await fetcher<RekomendasiItem[]>("/rekomendasi", 600);
      return Array.isArray(data) ? data : [];
    },
    []
  );
}

export async function fetchRecommendedGenres() {
  return safeApi<GenreRekomendasiItem[]>(
    async () => {
      const data = await fetcher<GenreRekomendasiItem[]>(
        "/genre-rekomendasi",
        3600
      );
      return Array.isArray(data) ? data : [];
    },
    []
  );
}

export async function fetchComicDetail(slug: string) {
  return safeApi<ComicDetail | null>(
    () => fetcher<ComicDetail>(`/detail-komik/${slug}`, 300),
    null
  );
}

export async function fetchChapterDetail(slug: string, chapter: string) {
  return safeApi<ChapterDetail | null>(
    () => fetcher<ChapterDetail>(`/baca-chapter/${slug}/${chapter}`, 600),
    null
  );
}

export async function searchComics(keyword: string) {
  return safeApi<SearchResponse>(
    () => fetcher<SearchResponse>(`/search?q=${encodeURIComponent(keyword)}`, 60),
    { status: false, data: [], total: 0 }
  );
}

export async function fetchLibraryComics(page = 1) {
  const normalizedPage = Math.max(1, Number(page) || 1);
  return safeApi<PustakaResponse>(
    () =>
      fetcher<PustakaResponse>(
        normalizedPage > 1 ? `/pustaka/page/${normalizedPage}` : "/pustaka",
        300
      ),
    { page: normalizedPage, results: [] }
  );
}

export async function fetchAllGenres() {
  return safeApi<GenreAllItem[]>(
    async () => {
      const data = await fetcher<GenreAllItem[]>("/genre-all", 3600);
      return Array.isArray(data) ? data : [];
    },
    []
  );
}

export async function fetchGenreComics(slug: string, page = 1) {
  const normalizedPage = Math.max(1, Number(page) || 1);
  return safeApi<GenreDetailResponse>(
    () =>
      fetcher<GenreDetailResponse>(
        normalizedPage > 1
          ? `/genre/${slug}/page/${normalizedPage}`
          : `/genre/${slug}`,
        300
      ),
    { success: false, currentPage: normalizedPage, data: [] }
  );
}

export async function fetchColoredComics(page = 1) {
  const normalizedPage = Math.max(1, Number(page) || 1);
  return safeApi<BerwarnaResponse>(
    () =>
      fetcher<BerwarnaResponse>(
        normalizedPage > 1 ? `/berwarna/${normalizedPage}` : "/berwarna",
        300
      ),
    { status: false, data: { page: normalizedPage, results: [] } }
  );
}
