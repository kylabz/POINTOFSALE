import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EditProduct() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (params.product) {
      const product = JSON.parse(params.product as string);
      setName(product.name);
      setPrice(product.price.toString());
      setQuantity(product.quantity.toString());
      setCategory(product.category);
      setImage(product.image);
    }
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const storedCategories = await AsyncStorage.getItem('categories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !price || !quantity || !category) {
      Alert.alert("Invalid input", "Please fill in all fields.");
      return;
    }

    try {
      const storedProducts = await AsyncStorage.getItem('products');
      let products = storedProducts ? JSON.parse(storedProducts) : [];

      // Replace the old product with the updated one (matched by original name)
      products = products.map((p: any) => p.name === JSON.parse(params.product as string).name
        ? { name, price: parseFloat(price), quantity: parseInt(quantity), category, image }
        : p
      );

      await AsyncStorage.setItem('products', JSON.stringify(products));
      Alert.alert('Success', 'Product updated successfully');
      router.push('/pos/pos');
    } catch (error) {
      Alert.alert('Error', 'Failed to update product.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Category</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text>Select Image</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#111',
    flexGrow: 1,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  imagePicker: {
    marginTop: 20,
    backgroundColor: '#333',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#228822',
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
  },
  saveText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
