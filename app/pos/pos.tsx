import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, Dimensions, Alert, ImageBackground as RNImageBackground, Modal, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const screenWidth = Dimensions.get('window').width;
const DEFAULT_CATEGORIES = ['Pizza', 'Coffee', 'Sandwich', 'Softdrinks'];

export default function POSMenu() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const params = useLocalSearchParams();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedProducts = await AsyncStorage.getItem('products');
      const storedCart = await AsyncStorage.getItem('cart');
      const storedCategories = await AsyncStorage.getItem('categories');

      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(DEFAULT_CATEGORIES);
        await AsyncStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (error) {
      console.error("Failed loading data:", error);
    }
  };

  useEffect(() => {
    if (params?.newProduct) {
      const product = JSON.parse(params.newProduct as string);
      setProducts(prev => {
        const exists = prev.find(p => p.name === product.name);
        if (exists) return prev;
        const updated = [...prev, product];
        AsyncStorage.setItem('products', JSON.stringify(updated));
        return updated;
      });
    }
  }, [params]);

  const handleAddToCart = (product: any) => {
    if (product.quantity <= 0) {
      Alert.alert("Out of stock", "This product is currently unavailable.");
      return;
    }

    const updatedProducts = products.map(p =>
      p.name === product.name ? { ...p, quantity: p.quantity - 1 } : p
    );
    setProducts(updatedProducts);
    AsyncStorage.setItem('products', JSON.stringify(updatedProducts));

    const found = cart.find(item => item.name === product.name);
    if (found) {
      const updatedCart = cart.map(item =>
        item.name === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const newCart = [...cart, { ...product, quantity: 1 }];
      setCart(newCart);
      AsyncStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const handleRemoveFromCart = (index: number) => {
    const itemToRemove = cart[index];
    const updatedProducts = products.map(p =>
      p.name === itemToRemove.name
        ? { ...p, quantity: p.quantity + itemToRemove.quantity }
        : p
    );
    setProducts(updatedProducts);
    AsyncStorage.setItem('products', JSON.stringify(updatedProducts));

    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Modal open handler
  const openDeleteModal = (productName: string) => {
    setProductToDelete(productName);
    setModalVisible(true);
  };

  // Modal confirm handler
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const updatedProducts = products.filter(product => product.name !== productToDelete);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);

      const updatedCart = cart.filter(item => item.name !== productToDelete);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      setCart(updatedCart);

      setModalVisible(false);
      setProductToDelete(null);
    } catch (error) {
      Alert.alert("Error", "Failed to delete product.");
      console.error(error);
      setModalVisible(false);
      setProductToDelete(null);
    }
  };

  // Modal cancel handler
  const cancelDeleteProduct = () => {
    setModalVisible(false);
    setProductToDelete(null);
  };

  const handleGenerateReceipt = async () => {
    if (cart.length === 0) {
      Alert.alert("No Purchase", "Your cart is empty.");
      return;
    }
    await AsyncStorage.setItem('receiptCart', JSON.stringify(cart));
    setCart([]);
    AsyncStorage.setItem('cart', JSON.stringify([]));
    router.push('/pos/ReceiptScreen');
  };

  const filteredProducts = products.filter(p =>
    (!selectedCategory || p.category === selectedCategory) &&
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RNImageBackground
      source={require('../../assets/background/fastfood.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.overlay}>
            <Text style={styles.header}>FASTFOOD MENU</Text>

            <TextInput
              placeholder="Search product"
              placeholderTextColor="#ccc"
              style={styles.searchBar}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryButton, selectedCategory === cat && styles.selectedCategory]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryText, selectedCategory === cat && { color: '#fff' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.categoryButton, selectedCategory === null && styles.selectedCategory]}
                onPress={() => setSelectedCategory(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, selectedCategory === null && { color: '#fff' }]}>All</Text>
              </TouchableOpacity>
            </ScrollView>

            <ScrollView contentContainerStyle={[styles.grid, { flexGrow: 1 }]}>
              {filteredProducts.map((product, index) => (
                product.image ? (
                  <RNImageBackground
                    key={index}
                    source={{ uri: product.image }}
                    style={[styles.card, product.quantity <= 0 && styles.cardDisabled]}
                    imageStyle={styles.cardImage}
                    resizeMode="cover"
                  >
                    <View style={styles.cardOverlay}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>₱{product.price}</Text>
                      <Text style={styles.productStock}>Stock: {product.quantity}</Text>
                      <Text style={styles.productCategory}>{product.category}</Text>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => openDeleteModal(product.name)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => handleAddToCart(product)}
                        disabled={product.quantity <= 0}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                      </TouchableOpacity>
                    </View>
                  </RNImageBackground>
                ) : (
                  <View
                    key={index}
                    style={[
                      styles.card,
                      styles.cardNoImage,
                      product.quantity <= 0 && styles.cardDisabled
                    ]}
                  >
                    <View style={styles.noImage}>
                      <Text style={styles.noImageText}>No Image</Text>
                    </View>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>₱{product.price}</Text>
                    <Text style={styles.productStock}>Stock: {product.quantity}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => openDeleteModal(product.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addToCartButton}
                      onPress={() => handleAddToCart(product)}
                      disabled={product.quantity <= 0}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                )
              ))}
            </ScrollView>

            <View style={styles.cartContainer}>
              <Text style={styles.cartTitle}>Cart</Text>
              {cart.length === 0 ? (
                <Text style={styles.emptyCart}>No items added yet</Text>
              ) : (
                cart.map((item, i) => (
                  <View key={i} style={styles.cartRow}>
                    <Text style={styles.cartItem}>
                      {item.name} - ₱{item.price} x {item.quantity}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveFromCart(i)} activeOpacity={0.7}>
                      <Text style={styles.remove}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.addButton} onPress={() => router.push('/pos/AddProduct')} activeOpacity={0.7}>
                <Text style={styles.btnText}>+ Product</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.receiptButton} onPress={handleGenerateReceipt} activeOpacity={0.7}>
                <Text style={styles.btnText}>Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/pos/Settings')} activeOpacity={0.7}>
                <Text style={styles.btnText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/pos/ChatSupport')} activeOpacity={0.7}>
                <Text style={styles.btnText}>Chat</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Modal for Delete Confirmation */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={cancelDeleteProduct}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Delete Product</Text>
                  <Text style={styles.modalMessage}>
                    Are you sure you want to delete this product?
                  </Text>
                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity style={styles.modalCancelButton} onPress={cancelDeleteProduct} activeOpacity={0.7}>
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalDeleteButton} onPress={confirmDeleteProduct} activeOpacity={0.7}>
                      <Text style={styles.modalDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </RNImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, padding: 10 },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#000' },
  searchBar: {
    backgroundColor: '#eee', color: '#000',
    borderRadius: 10, padding: 10,
    marginBottom: 10,
  },
  categoryScroll: { maxHeight: 50, marginBottom: 10 },
  categoryButton: {
    backgroundColor: '#ccc',
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedCategory: {
    backgroundColor: '#0080ff',
  },
  categoryText: {
    color: '#000',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    margin: 5,
    width: screenWidth / 2 - 20,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 220,
    backgroundColor: '#fff', // fallback for no image
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardOverlay: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardNoImage: {
    backgroundColor: '#ccc',
    height: 200,
    justifyContent: 'flex-end',
  },
  noImage: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#888',
    fontWeight: 'bold',
  },
  productName: { color: '#fff', fontWeight: '800', fontSize: 18, marginBottom: 2, textAlign: 'center' },
  productPrice: { color: '#fff', fontWeight: '700', fontSize: 15,  marginBottom: 2 },
  productStock: { color: '#fff', fontWeight: '800', fontSize: 15, marginBottom: 2 },
  productCategory: { color: '#fff', marginBottom: 10, fontSize: 12 },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 8,
  },
  deleteText: { color: '#fff', fontWeight: 'bold' },
  addToCartButton: {
    backgroundColor: '#00aa00',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  addToCartText: { color: '#fff', fontWeight: 'bold' },
  cartContainer: {
    backgroundColor: '#eee',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    maxHeight: 150,
  },
  cartTitle: { color: '#000', fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  emptyCart: { color: '#999', fontStyle: 'italic' },
  cartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cartItem: { color: '#000' },
  remove: { color: '#f44', fontWeight: 'bold' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  addButton: {
    backgroundColor: '#0080ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginVertical: 5,
  },
  receiptButton: {
    backgroundColor: '#ffaa00',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginVertical: 5,
  },
  settingsButton: {
    backgroundColor: '#666',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginVertical: 5,
  },
  chatButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginVertical: 5,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  modalMessage: {
    color: '#000',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    backgroundColor: '#888',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  modalDeleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
