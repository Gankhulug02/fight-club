# Supabase Storage Setup for Team Logos

This guide will help you set up the Supabase Storage bucket to store team logo images.

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `team-assets`
   - **Public bucket**: Toggle ON (so logos are publicly accessible)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: Leave empty or specify: `image/png, image/jpeg, image/jpg, image/gif, image/webp`
5. Click **Create bucket**

## Step 2: Set Up Storage Policies (if needed)

If you made the bucket public, the policies are automatically configured. Otherwise, add these policies:

### Policy 1: Public Read Access

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'team-assets' );
```

### Policy 2: Authenticated Upload

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'team-assets' );
```

### Policy 3: Authenticated Update (Optional)

```sql
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'team-assets' );
```

### Policy 4: Authenticated Delete (Optional)

```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'team-assets' );
```

## Step 3: Folder Structure

The application automatically creates this structure:

```
team-assets/
  └── team-logos/
      ├── [timestamp]-[random].png
      ├── [timestamp]-[random].jpg
      └── ...
```

## Step 4: Test Upload

1. Go to `/admin/teams` in your application
2. Click **+ Add New Team**
3. Fill in the team name
4. Upload a logo image
5. Click **Create Team**

The image should upload to Supabase Storage and the URL should be saved in the database.

## Configuration

The upload configuration is in `/app/admin/teams/page.tsx`:

```typescript
const uploadLogo = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;
  const filePath = `team-logos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("team-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("team-assets").getPublicUrl(filePath);

  return publicUrl;
};
```

## Troubleshooting

### Error: "bucket not found"

- Make sure you created a bucket named exactly `team-assets`
- Check the bucket name in the code matches your bucket name

### Error: "new row violates row-level security policy"

- Enable public access on the bucket, or
- Add the storage policies mentioned above

### Error: "File size too large"

- Adjust the file size limit in your bucket settings
- Or compress images before uploading

### Images not displaying

- Check that the bucket is set to **public**
- Verify the URL in the database is correct
- Check browser console for CORS errors

## Security Considerations

- The current setup allows any authenticated user to upload
- Consider adding file size validation on the client side
- Consider adding file type validation
- Consider implementing image optimization/resizing
- For production, you may want to restrict who can upload

## File Size Recommendations

- **Recommended**: 200x200 to 512x512 pixels
- **Max file size**: 5MB
- **Formats**: PNG (for transparency), JPG, or WebP
- **Optimization**: Compress images before upload using tools like TinyPNG
