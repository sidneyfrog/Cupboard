import { supabase } from '@/config/supabase';
import { STORAGE_BUCKETS } from '@/config/storage';
import { generateId } from '@/utils';

type BucketName = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/**
 * Uploads an image to the specified Supabase storage bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(
  bucket: BucketName,
  uri: string,
  fileName?: string
): Promise<string> {
  const extension = uri.split('.').pop() ?? 'jpg';
  const name = fileName ?? `${generateId()}.${extension}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(name, blob, { contentType: `image/${extension}`, upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(name);
  return data.publicUrl;
}

/** Deletes an image from the specified bucket by file path. */
export async function deleteImage(bucket: BucketName, filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) throw new Error(error.message);
}
