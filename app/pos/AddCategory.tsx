import React, { useState, useEffect } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, Alert,
  ImageBackground, SafeAreaView, Platform, StatusBar, FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../firebase/FirebaseConfig';
import {
  collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, onSnapshot
} from 'firebase/firestore';

export default function AddCategory() {
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();

  // Load categories from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: string[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data && data.name) cats.push(data.name);
      });
      setCategories(cats.length > 0 ? cats : ['Pizza', 'Coffee', 'Sandwich', 'Softdrinks']);
    });
    return () => unsubscribe();
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
    try {
      await addDoc(collection(db, 'categories'), {
        name: trimmed,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Success", `Category "${trimmed}" added.`);
      setCategory('');
    } catch (e) {
      Alert.alert("Error", "Failed to add category.");
    }
  };

  const handleDeleteCategory = async (item: string) => {
    try {
      // Find the Firestore doc with this category name
      const querySnapshot = await getDocs(collection(db, 'categories'));
      let docIdToDelete: string | null = null;
      querySnapshot.forEach(docSnap => {
        if (docSnap.data().name === item) {
          docIdToDelete = docSnap.id;
        }
      });
      if (docIdToDelete) {
        await deleteDoc(doc(db, 'categories', docIdToDelete));
        Alert.alert("Deleted", `Category "${item}" removed.`);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to delete category.");
    }
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