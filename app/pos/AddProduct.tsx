import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase/FirebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const DEFAULT_CATEGORIES = ['Pizza', 'Coffee', 'Sandwich', 'Softdrinks'];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AddProduct() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [image, setImage] = useState<File | string | null>(null); // string (mobile) or File (web)
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null); // always a displayable URI/base64
  const [imagePicking, setImagePicking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    (async () => {
      try {
        const storedCategories = await AsyncStorage.getItem('categories');
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          setCategories(DEFAULT_CATEGORIES);
          await AsyncStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
        }
      } catch (error) {
        setCategories(DEFAULT_CATEGORIES);
      }
    })();
  }, []);

  // Pick image from gallery and save local URI (mobile only)
  const handlePickImage = async () => {
    setImagePicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setImage(result.assets[0].uri);
        setImagePreviewUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image.');
      console.error('ImagePicker error:', err);
    }
    setImagePicking(false);
  };

  // Handle web file input
  const handleWebFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      // Convert to base64 for preview and storage
      const base64 = await fileToBase64(file);
      setImagePreviewUri(base64);
    }
  };

  // Add product and save to Firestore (image is local URI or base64 string)
  const handleAdd = async () => {
    if (!name || !price || !category) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }
    if (imagePicking) {
      Alert.alert('Please wait', 'Image is still being picked...');
      return;
    }
    setLoading(true);

    try {
      let imageUrl: string | null = null;
      if (image) {
        if (typeof image === 'string') {
          // Mobile: URI
          imageUrl = image;
        } else if (Platform.OS === 'web' && image instanceof File) {
          // Web: base64 string
          imageUrl = await fileToBase64(image);
        }
      }

      const newProduct = {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity) || 0,
        category,
        image: imageUrl,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'products'), newProduct);

      Alert.alert('Success', 'Product added!');
      setName('');
      setPrice('');
      setQuantity('');
      setCategory('');
      setImage(null);
      setImagePreviewUri(null);
      router.push('/pos/pos'); // Update this if your POS route is different
    } catch (error: any) {
      console.error('Add product error:', error);
      Alert.alert('Error', error.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  // Delete category with confirmation and force update
  const handleDeleteCategory = (catToDelete: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${catToDelete}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedCategories = categories.filter(cat => cat !== catToDelete);
              await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
              setCategories([...updatedCategories]);
              if (category === catToDelete) {
                setCategory('');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete category. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Add Product</Text>

          <TextInput
            placeholder="Product Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!loading}
          />

          {/* Mobile: Pick image from gallery */}
          <Button title="Pick Image" onPress={handlePickImage} disabled={loading || imagePicking} />

          {/* Web: File input */}
          {Platform.OS === 'web' && (
            <input
              type="file"
              accept="image/*"
              onChange={handleWebFileInput}
              style={{ marginBottom: 16 }}
            />
          )}

          {imagePicking && <ActivityIndicator size="small" color="#007bff" style={{ marginVertical: 10 }} />}
          {imagePreviewUri && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imageText}>Image selected:</Text>
              {Platform.OS === 'web' ? (
                <img
                  src={imagePreviewUri}
                  alt="preview"
                  style={{ width: 150, height: 150, borderRadius: 8, marginTop: 5, objectFit: 'cover' }}
                />
              ) : (
                <Image source={{ uri: imagePreviewUri }} style={styles.imagePreview} />
              )}
            </View>
          )}

          <TextInput
            placeholder="Price"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            style={styles.input}
            editable={!loading}
          />

          <TextInput
            placeholder="Quantity"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={(val) => setCategory(val)}
              dropdownIconColor="#fff"
              style={{ color: '#fff' }}
              enabled={!loading}
            >
              <Picker.Item label="Select a category" value="" color="#999" />
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          <Button title={loading ? "Adding..." : "Add Product"} onPress={handleAdd} disabled={loading || imagePicking} />

          {/* Optional: Category management UI */}
          <Text style={[styles.label, { marginTop: 20 }]}>Manage Categories</Text>
          {categories.map((cat) => (
            <View key={cat} style={styles.categoryRow}>
              <Text style={styles.categoryText}>{cat}</Text>
              <Button title="Delete" color="#c0392b" onPress={() => handleDeleteCategory(cat)} disabled={loading} />
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#000' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    padding: 10,
    marginVertical: 8,
    borderRadius: 6,
    color: '#fff',
  },
  imageText: { marginVertical: 10, fontStyle: 'italic', color: '#0f0' },
  imagePreviewContainer: { alignItems: 'center', marginVertical: 10 },
  imagePreview: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
    marginTop: 5,
  },
  label: { color: '#fff', marginTop: 10, marginBottom: 5, fontWeight: '600' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 6,
    marginBottom: 20,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#222',
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  categoryText: { color: '#fff', fontSize: 16 },
  deleteButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
});