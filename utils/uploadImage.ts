import { Platform } from 'react-native';

export async function uploadImageToCloudinary(image: any): Promise<string> {
  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dl8hlg4m8/image/upload';
  const UPLOAD_PRESET = 'fastfood_final_cloudinary';

  const formData = new FormData();

  if (Platform.OS === 'web' && image instanceof File) {
    formData.append('file', image);
  } else {
    const fileName = image.split('/').pop() || 'photo.jpg';
    const extension = fileName.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';
    if (extension === 'png') mimeType = 'image/png';
    else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
    else if (extension === 'webp') mimeType = 'image/webp';

    formData.append('file', {
      uri: image,
      type: mimeType,
      name: fileName,
    } as any);
  }

  formData.append('upload_preset', UPLOAD_PRESET);

  // ...rest of your upload logic...
}