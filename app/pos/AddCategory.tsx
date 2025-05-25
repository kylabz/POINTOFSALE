import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ImageBackground, SafeAreaView, Platform, StatusBar, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AddCategory() {
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      const stored = await AsyncStorage.getItem('categories');
      if (stored) setCategories(JSON.parse(stored));
      else setCategories(['Pizza', 'Coffee', 'Sandwich', 'Softdrinks']);
    };
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    const trimmed = category.trim();
    if (!trimmed) {
      Alert.alert("Error", "Category cannot be empty.");
      return;
    }
    if (categories.includes(trimmed)) {
      Alert.alert("Error", "Category already exists.");
      return;
    }

    const updatedCategories = [...categories, trimmed];
    setCategories(updatedCategories);
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
    Alert.alert("Success", `Category "${trimmed}" added.`);
    setCategory('');
  };

  const handleDeleteCategory = async (item: string) => {
    const updated = categories.filter(cat => cat !== item);
    setCategories(updated);
    await AsyncStorage.setItem('categories', JSON.stringify(updated));
    Alert.alert("Deleted", `Category "${item}" removed.`);
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryText}>{item}</Text>
      <TouchableOpacity onPress={() => handleDeleteCategory(item)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../../assets/background/fastfood.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Add New Category</Text>
          <TextInput
            placeholder="Enter category name"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={category}
            onChangeText={setCategory}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddCategory}>
            <Text style={styles.btnText}>Add Category</Text>
          </TouchableOpacity>

          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            renderItem={renderCategoryItem}
            style={{ width: '100%', marginTop: 10 }}
          />

          <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => router.back()}>
            <Text style={styles.btnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  input: {
    backgroundColor: '#222',
    width: '100%',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6a1b9a',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: { backgroundColor: '#444' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    width: '100%',
  },
  categoryText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#e53935',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
