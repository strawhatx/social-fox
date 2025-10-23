-- CreateTable
CREATE TABLE "blog_pages" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    hero_image TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    cta_text TEXT NOT NULL,
    cta_link TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ(6),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_pages_slug_key" ON "blog_pages"("slug");