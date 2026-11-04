const DEEZER_BASE_URL = "https://api.deezer.com";
const CACHE_TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, {data: unknown; expires: number }>();

async function deezerGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T>{
    const url = new URL(path, DEEZER_BASE_URL);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

    const key = url.toString();
    const cached = cache.get(key);
    if(cached && cached.expires > Date.now()) return cached.data as T;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Deezer responded with ${res.status}`);

    const data = await res.json();
    if (data?.error) throw new Error(`Deeer error: ${data.error.message ?? "unknown"}`);

    cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
    return data as T;
}

export const searchTracks = (q: string, limit = 25, index = 0) =>
    deezerGet("/search/track", { q, limit, index });

export const searchArtists = (q: string, limit = 25, index = 0) =>
    deezerGet("/search/artist", { q, limit, index });

export const getArtist = (id: number) => deezerGet(`/artist/${id}`);
export const getArtistAlbums = (id: number) => deezerGet(`/artist/${id}/albums`);
export const getAlbum = (id: number) => deezerGet(`/album/${id}`);