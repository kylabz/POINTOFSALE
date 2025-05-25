// myproject/firebase/storage.ts
import { storage} from './Config'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadImageAsync = async (uri: string, imageName: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `products/${imageName}`);
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
