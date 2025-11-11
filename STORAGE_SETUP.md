# Team Logo Image Upload Setup

## Supabase Storage Bucket Setup

To enable image uploads for team logos, you need to create a storage bucket in Supabase and set up Row Level Security (RLS) policies.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on "Storage" in the left sidebar

2. **Create New Bucket**
   - Click "New bucket"
   - Name: `team-logos`
   - Make it **Public** (toggle ON)
   - Click "Create bucket"

3. **Set Up RLS Policies** ⚠️ **REQUIRED**
   
   The bucket needs RLS policies to allow uploads. Run the SQL script:
   
   **Option A: Quick Setup (Public Access)**
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `supabase-storage-team-logos-policies.sql`
   - Click "Run"
   
   This will allow:
   - ✅ Public read access (anyone can view images)
   - ✅ Public upload access (anyone can upload)
   - ✅ Public update/delete access
   
   **Option B: Secure Setup (Authenticated Only)**
   - If you want only authenticated users to upload:
   - Uncomment the "ALTERNATIVE" section in the SQL file
   - Comment out the public policies
   - Run the SQL script
   
   This will allow:
   - ✅ Public read access (anyone can view images)
   - 🔒 Only authenticated users can upload/update/delete

### Troubleshooting

**Error: "new row violates row-level security policy"**
- This means RLS policies are not set up correctly
- Run the SQL script in `supabase-storage-team-logos-policies.sql`
- Make sure the bucket name is exactly `team-logos`

**Error: "Bucket not found"**
- Create the bucket first in Storage → New bucket
- Name it exactly `team-logos`
- Make it public

### Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### File Size Limit

Maximum file size: **5MB**

### Usage

Once the bucket is set up:
1. Go to `/admin/teams`
2. Click "Add New Team" or edit an existing team
3. Use the "Upload Image" button to upload a logo
4. Or continue using emojis as before (backward compatible)

The system automatically detects if a logo is an image URL or an emoji and displays accordingly.

