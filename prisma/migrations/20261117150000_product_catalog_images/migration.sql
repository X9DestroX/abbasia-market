ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'PENDING_REVIEW' BEFORE 'ACTIVE';

-- Product image gallery and initial marketplace categories.
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductImage_productId_position_idx" ON "ProductImage"("productId", "position");
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Category" ("id", "name", "slug", "parentId", "createdAt", "updatedAt")
VALUES
('cat-electronics', 'Électronique', 'electronics', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-fashion', 'Mode', 'fashion', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-beauty', 'Beauté', 'beauty', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-home', 'Maison', 'home', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-accessories', 'Accessoires', 'accessories', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
