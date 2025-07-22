# Supabase File Upload Setup Guide

This guide will help you set up Supabase Storage for the profile setup file upload system.

## 1. Prerequisites

- A Supabase account (sign up at https://supabase.com)
- A Supabase project created

## 2. Environment Variables Setup

1. Copy the example environment file:
```bash
cp .env.supabase.example .env.local
```

2. Get your Supabase project credentials:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to Settings > API
   - Copy the values:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

3. Update your `.env.local` file with the actual values.

## 3. Create Storage Bucket

1. In your Supabase dashboard, go to Storage
2. Click "Create bucket"
3. Set the following:
   - **Name**: `profile-documents`
   - **Public**: Leave unchecked (we'll handle access via RLS)
   - **File size limit**: 10MB
   - **Allowed MIME types**: Leave empty (we'll validate in code)

## 4. Set Up Row Level Security (RLS) Policies

Go to Storage > Policies and create the following policies for the `profile-documents` bucket:

### Policy 1: Allow authenticated users to upload their own files

```sql
-- Policy name: Users can upload their own profile documents
-- Operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Users can upload their own profile documents" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: Allow authenticated users to view their own files

```sql
-- Policy name: Users can view their own profile documents
-- Operation: SELECT
-- Target roles: authenticated

CREATE POLICY "Users can view their own profile documents" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 3: Allow authenticated users to delete their own files

```sql
-- Policy name: Users can delete their own profile documents
-- Operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Users can delete their own profile documents" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 4: Allow admins to access all files

```sql
-- Policy name: Admins can access all profile documents
-- Operation: ALL
-- Target roles: authenticated

CREATE POLICY "Admins can access all profile documents" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'profile-documents' AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
  )
);
```

## 5. File Organization Structure

Files will be organized in the bucket as follows:
```
profile-documents/
├── {userId}/
│   ├── resume/
│   │   └── {timestamp}-{filename}
│   └── certification/
│       ├── {timestamp}-{filename1}
│       └── {timestamp}-{filename2}
```

## 6. Testing the Setup

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/profile-setup` in your application
3. Complete steps 1-4 to reach the document upload step
4. Try uploading a test file
5. Check the Supabase Storage dashboard to verify the file was uploaded

## 7. Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables" error**
   - Ensure all three environment variables are set in `.env.local`
   - Restart your development server after adding variables

2. **Upload fails with "Unauthorized" error**
   - Check that RLS policies are correctly configured
   - Ensure the user is authenticated before attempting upload

3. **"Bucket not found" error**
   - Verify the bucket name is exactly `profile-documents`
   - Check that the bucket exists in your Supabase project

4. **File size limit exceeded**
   - Default limit is 10MB per file
   - Adjust the validation in `file-upload.ts` if needed

### Enable Storage Logs

To debug issues, enable storage logs in Supabase:
1. Go to Logs > Storage Logs
2. Monitor real-time logs during upload attempts

## 8. Production Considerations

1. **File Size Limits**: Consider implementing progressive upload for large files
2. **Virus Scanning**: Implement virus scanning for uploaded files
3. **CDN**: Consider using a CDN for faster file delivery
4. **Backup**: Set up automated backups for important documents
5. **Monitoring**: Monitor storage usage and costs

## 9. Security Best Practices

1. **File Type Validation**: Always validate file types on both client and server
2. **Size Limits**: Enforce reasonable file size limits
3. **User Isolation**: Ensure users can only access their own files
4. **Regular Audits**: Regularly audit file access patterns
5. **HTTPS Only**: Always use HTTPS for file uploads and downloads

## 10. API Usage

The file upload system provides these APIs:

- `POST /api/upload` - Upload a file
- `DELETE /api/upload?fileName={fileName}` - Delete a file
- Client utilities in `@/lib/utils/file-upload`:
  - `uploadFileViaAPI()` - Upload via API
  - `deleteFile()` - Delete file
  - `validateFile()` - Validate file before upload

## Next Steps

Once your file upload system is working:

1. Test the complete profile setup flow
2. Implement additional file types if needed
3. Add file preview functionality
4. Set up file processing workflows (e.g., PDF text extraction)
5. Implement file sharing features for job applications
