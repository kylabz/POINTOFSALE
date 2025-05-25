import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddProduct() {
  const router = useRouter();
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imagePicking, setImagePicking] = useState(false);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    (async () => {
      try {
        const storedCategories = await AsyncStorage.getItem('categories');
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          const defaultCategories = ['Pizza', 'Coffee', 'Sandwich', 'Softdrinks'];
          setCategories(defaultCategories);
          await AsyncStorage.setItem('categories', JSON.stringify(defaultCategories));
        }
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    })();
  }, []);

  // Pick image from gallery and save local URI
  const handlePickImage = async () => {
    setImagePicking(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setImage(result.assets[0].uri); // Save the local file URI
    }
    setImagePicking(false);
  };

  // Add product and save locally
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

    const newProduct = {
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 0,
      category,
      image, // This is the local file URI
    };

    try {
      // Save to AsyncStorage
      const storedProducts = await AsyncStorage.getItem('products');
      const products = storedProducts ? JSON.parse(storedProducts) : [];
      products.push(newProduct);
      await AsyncStorage.setItem('products', JSON.stringify(products));

      // Go back to POS screen and pass new product
      router.push({
        pathname: '/pos/pos',
        params: { newProduct: JSON.stringify(newProduct) },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save product locally.');
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
              setCategories([...updatedCategories]); // Spread to force re-render

              // Clear selected category if deleted
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
    <View style={styles.container}>
      <Text style={styles.title}>Add Product</Text>

      <TextInput
        placeholder="Product Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Button title="Pick Image" onPress={handlePickImage} />
      {imagePicking && <ActivityIndicator size="small" color="#007bff" style={{ marginVertical: 10 }} />}
      {image && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.imageText}>Image selected:</Text>
          <Image source={{ uri: image }} style={styles.imagePreview} />
        </View>
      )}

      <TextInput
        placeholder="Price"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        style={styles.input}
      />

      <TextInput
        placeholder="Quantity"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
        style={styles.input}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={category}
          onValueChange={(val) => setCategory(val)}
          dropdownIconColor="#fff"
          style={{ color: '#fff' }}
        >
          <Picker.Item label="Select a category" value="" color="#999" />
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <Button title={loading ? "Adding..." : "Add Product"} onPress={handleAdd} disabled={loading || imagePicking} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
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