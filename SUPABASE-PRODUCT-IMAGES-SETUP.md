# ABBASIA.SHOP — Product image storage setup

Product photos are uploaded by approved sellers to a public Supabase Storage bucket named `product-images`. The bucket stores real seller-provided JPEG, PNG and WebP photographs. The public storefront displays only products with `ACTIVE` status, positive stock and an approved seller.

## 1. Create the bucket and policies

Open Supabase Dashboard → SQL Editor and run this script once:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Public can view ABBASIA product images" on storage.objects;
create policy "Public can view ABBASIA product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Approved sellers upload their own product images" on storage.objects;
create policy "Approved sellers upload their own product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public."User" u
    join public."SellerProfile" s on s."userId" = u.id
    where u.id = auth.uid()::text
      and u.role = 'SELLER'
      and u.status = 'ACTIVE'
      and s."isApproved" = true
  )
);

drop policy if exists "Approved sellers delete their own product images" on storage.objects;
create policy "Approved sellers delete their own product images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public."User" u
    join public."SellerProfile" s on s."userId" = u.id
    where u.id = auth.uid()::text
      and u.role = 'SELLER'
      and u.status = 'ACTIVE'
      and s."isApproved" = true
  )
);
```

## 2. Upload rules

- JPG/JPEG, PNG and WebP only.
- Maximum 5 MB per image.
- Up to 8 images per product.
- First image is the cover photo.
- Images are stored under the seller's Supabase Auth UUID folder.
- Only approved, active sellers can upload through the application.
- Public read access is enabled so product photos can load in the storefront.

## 3. Important

Never put a Supabase service-role key in a browser variable or client component. This implementation uses the authenticated Supabase server client and Storage Row Level Security policies.
