import { prisma } from "../lib/prisma.js";
import * as deezer from "./deezerService.js";
import type { DeezerArtistRef } from "./deezerService.js";

function uniqueArtists(list: DeezerArtistRef[]): DeezerArtistRef[] {
    const seen = new Set<number>();
    return list.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
}

export async function ensureTrackFromDeezer(deezerTrackId: number): Promise<string> {

    // doesn't import tracks from deezer if they're already in the database
    const existing = await prisma.track.findUnique({
        where: { deezer_id: String(deezerTrackId) },
        select: { id: true },
    });
    if (existing) return existing.id;

    const track = await deezer.getTrack(deezerTrackId);
    const album = await deezer.getAlbum(track.album.id);

    const trackArtists = uniqueArtists(track.contributors?.length ? track.contributors : [track.artist]);
    const albumArtists = uniqueArtists(album.contributors?.length ? album.contributors : [album.artist]);

    const saved = await prisma.$transaction(async (tx) => {
        const artistIds = new Map<number, string>();
        for (const a of uniqueArtists([...trackArtists, ...albumArtists])) {
            const artist = await tx.artist.upsert({
                where: { deezer_id: String(a.id) },
                create: { name: a.name, deezer_id: String(a.id) },
                update: {},
                select: { id: true },
            });
            artistIds.set(a.id, artist.id);
        }

        const dbAlbum = await tx.album.upsert({
            where: { deezer_id: String(album.id) },
            create: {
                name: album.title,
                release_date: new Date(album.release_date),
                cover_url: album.cover_xl ?? null,
                deezer_id: String(album.id),
                artists: {
                    create: albumArtists.map((a, i) => ({
                        position: i,
                        artist: { connect: { id: artistIds.get(a.id)! } },
                    })),
                },
            },
            update: {},
            select: { id: true },
        });

        return tx.track.upsert({
            where: { deezer_id: String(track.id) },
            create: {
                name: track.title,
                duration_in_s: track.duration,
                position_in_album: track.track_position,
                deezer_id: String(track.id),
                album: { connect: { id: dbAlbum.id } },
                artists: {
                    create: trackArtists.map((a, i) => ({
                        position: i,
                        artist: { connect: { id: artistIds.get(a.id)! } },
                    })),
                },
            },
            update: {},
            select: { id: true },
        });
    });

    return saved.id;
}
