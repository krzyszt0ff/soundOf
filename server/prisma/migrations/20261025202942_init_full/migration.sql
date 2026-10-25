-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Pin" (
    "id" TEXT NOT NULL,
    "track_id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "publish_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PinLike" (
    "user_id" TEXT NOT NULL,
    "pin_id" TEXT NOT NULL,

    CONSTRAINT "PinLike_pkey" PRIMARY KEY ("user_id","pin_id")
);

-- CreateTable
CREATE TABLE "PinComment" (
    "id" TEXT NOT NULL,
    "pin_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "publish_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT NOT NULL,

    CONSTRAINT "PinComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration_in_ms" INTEGER NOT NULL,
    "album_id" TEXT NOT NULL,
    "deezer_id" TEXT,
    "position_in_album" INTEGER NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "cover_url" TEXT,
    "deezer_id" TEXT,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT,
    "deezer_id" TEXT,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackArtist" (
    "track_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "TrackArtist_pkey" PRIMARY KEY ("track_id","artist_id")
);

-- CreateTable
CREATE TABLE "AlbumArtist" (
    "album_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "AlbumArtist_pkey" PRIMARY KEY ("album_id","artist_id")
);

-- CreateIndex
CREATE INDEX "Pin_user_id_publish_date_idx" ON "Pin"("user_id", "publish_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Track_deezer_id_key" ON "Track"("deezer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Track_album_id_position_in_album_key" ON "Track"("album_id", "position_in_album");

-- CreateIndex
CREATE UNIQUE INDEX "Album_deezer_id_key" ON "Album"("deezer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_user_id_key" ON "Artist"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_deezer_id_key" ON "Artist"("deezer_id");

-- CreateIndex
CREATE INDEX "TrackArtist_artist_id_idx" ON "TrackArtist"("artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "TrackArtist_track_id_position_key" ON "TrackArtist"("track_id", "position");

-- CreateIndex
CREATE INDEX "AlbumArtist_artist_id_idx" ON "AlbumArtist"("artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumArtist_album_id_position_key" ON "AlbumArtist"("album_id", "position");

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinLike" ADD CONSTRAINT "PinLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinLike" ADD CONSTRAINT "PinLike_pin_id_fkey" FOREIGN KEY ("pin_id") REFERENCES "Pin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinComment" ADD CONSTRAINT "PinComment_pin_id_fkey" FOREIGN KEY ("pin_id") REFERENCES "Pin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinComment" ADD CONSTRAINT "PinComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumArtist" ADD CONSTRAINT "AlbumArtist_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumArtist" ADD CONSTRAINT "AlbumArtist_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
