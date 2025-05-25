// src/components/FirebaseImage.tsx
import React, { useEffect, useState } from 'react';
import { Image, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/Config'


export default function FirebaseImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Reference to the file in Firebase Storage (adjust the path to your image)
        const imageRef = ref(storage, 'images/myImage.jpg');

        // Get the download URL
        const url = await getDownloadURL(imageRef);

        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.errorText}>Image not available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  errorText: {
    color: 'red',
  },
});
