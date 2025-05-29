/**
 * Upload an image to Cloudinary and return the secure URL.
 * @param uri Local file URI (e.g., from ImagePicker)
 * @returns The Cloudinary secure_url string
 */
export async function uploadToCloudinary(uri: string): Promise<string> {
  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/fastfood/image/upload';
  const UPLOAD_PRESET = 'unsign present';

  const fileName = uri.split('/').pop() || 'photo.jpg';
  // Try to infer the MIME type from the file extension
  const extension = fileName.split('.').pop()?.toLowerCase();
  let mimeType = 'image/jpeg';
  if (extension === 'png') mimeType = 'image/png';
  else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
  else if (extension === 'webp') mimeType = 'image/webp';

  const formData = new FormData();
  formData.append('file', {
    uri,
    type: mimeType,
    name: fileName,
  } as any);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Failed to upload image to Cloudinary: ' + errorText);
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error('Cloudinary did not return an image URL');
  }
  return data.secure_url;
}