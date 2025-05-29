import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Image, Dimensions, Alert, Modal, KeyboardAvoidingView, Platform, SafeAreaView, ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, setDoc, doc, updateDoc, deleteDoc, onSnapshot, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/FirebaseConfig';

const screenWidth = Dimensions.get('window').width;
const CARD_MARGIN = 8;
const GRID_HORIZONTAL_PADDING = 10 * 2; // overlay padding horizontal
const CARD_WIDTH = (screenWidth - GRID_HORIZONTAL_PADDING - CARD_MARGIN * 3) / 2;

const DEFAULT_CATEGORIES = ['Pizza', 'Coffee', 'Sandwich', 'Softdrinks'];

function isValidImageSource(image: string | undefined | null): boolean {
  if (!image) return false;
  return (
    image.startsWith('http') ||
    image.startsWith('file:') ||
    image.startsWith('data:image') ||
    image.startsWith('asset:/')
  );
}

export default function POSMenu() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prodArr: any[] = [];
      snapshot.forEach(doc => prodArr.push({ ...doc.data(), id: doc.id }));
      setProducts(prodArr);
    });

    const unsubCart = onSnapshot(collection(db, 'cart'), (snapshot) => {
      const cartArr: any[] = [];
      snapshot.forEach(doc => cartArr.push({ ...doc.data(), id: doc.id }));
      setCart(cartArr);
    });

    return () => {
      unsubProducts();
      unsubCart();
    };
  }, []);

  const handleAddToCart = async (product: any) => {
    if (product.quantity <= 0) {
      Alert.alert("Out of stock", "This product is currently unavailable.");
      return;
    }
    try {
      const prodRef = doc(db, 'products', product.id);
      await updateDoc(prodRef, { quantity: product.quantity - 1 });
      const cartItemRef = doc(db, 'cart', product.id);
      const cartSnap = await getDoc(cartItemRef);
      if (cartSnap.exists()) {
        await updateDoc(cartItemRef, { quantity: cartSnap.data().quantity + 1 });
      } else {
        await setDoc(cartItemRef, { ...product, quantity: 1 });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart.");
    }
  };

  const handleRemoveFromCart = async (index: number) => {
    const itemToRemove = cart[index];
    try {
      const prodRef = doc(db, 'products', itemToRemove.id);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        await updateDoc(prodRef, { quantity: prodSnap.data().quantity + itemToRemove.quantity });
      }
      const cartItemRef = doc(db, 'cart', itemToRemove.id);
      await deleteDoc(cartItemRef);
    } catch (error) {
      Alert.alert("Error", "Failed to remove from cart.");
    }
  };

  const openDeleteModal = (productId: string) => {
    setProductToDelete(productId);
    setModalVisible(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteDoc(doc(db, 'products', productToDelete));
      await deleteDoc(doc(db, 'cart', productToDelete));
      setModalVisible(false);
      setProductToDelete(null);
    } catch (error) {
      Alert.alert("Error", "Failed to delete product.");
      setModalVisible(false);
      setProductToDelete(null);
    }
  };

  const cancelDeleteProduct = () => {
    setModalVisible(false);
    setProductToDelete(null);
  };

  const handleGenerateReceipt = async () => {
    if (cart.length === 0) {
      Alert.alert("No Purchase", "Your cart is empty.");
      return;
    }
    try {
      await addDoc(collection(db, 'receipts'), {
        items: cart,
        timestamp: new Date()
      });
      for (const item of cart) {
        await deleteDoc(doc(db, 'cart', item.id));
      }
      router.push('/pos/ReceiptScreen');
    } catch (error) {
      Alert.alert("Error", "Failed to generate receipt.");
    }
  };

  const filteredProducts = products.filter(p =>
    (!selectedCategory || p.category === selectedCategory) &&
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For FlatList: always two columns, fill with empty items if odd number
  const productData = filteredProducts.length % 2 === 0
    ? filteredProducts
    : [...filteredProducts, { empty: true, id: 'empty' }];

  const renderProduct = ({ item, index }: { item: any, index: number }) => {
    if (item.empty) {
      return <View style={[styles.card, { backgroundColor: 'transparent', elevation: 0, borderWidth: 0 }]} />;
    }
    const showImage = isValidImageSource(item.image);
    return (
      <View
        style={[
          styles.card,
          item.quantity <= 0 && styles.cardDisabled
        ]}
      >
        {showImage ? (
          <Image
            source={{ uri: item.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        <View style={styles.cardDetails}>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>₱{item.price}</Text>
          <Text style={styles.productStock}>Stock: {item.quantity}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => openDeleteModal(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item)}
              disabled={item.quantity <= 0}
              activeOpacity={0.7}
            >
              <Text style={styles.addToCartText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
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
              placeholderTextColor="#aaa"
              style={styles.searchBar}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Category bar is always visible, not overlayed */}
            <View style={styles.categoryBar}>
              <FlatList
                data={[...categories, 'All']}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      (selectedCategory === item || (item === 'All' && selectedCategory === null)) && styles.selectedCategory
                    ]}
                    onPress={() => setSelectedCategory(item === 'All' ? null : item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.categoryText,
                      (selectedCategory === item || (item === 'All' && selectedCategory === null)) && { color: '#fff' }
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingVertical: 5 }}
              />
            </View>

            {/* Product grid: always two columns, nice spacing */}
            <FlatList
              data={productData}
              renderItem={renderProduct}
              keyExtractor={(item, idx) => item.id ? item.id : `empty-${idx}`}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.grid}
              ListEmptyComponent={
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No products found.</Text>
              }
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              removeClippedSubviews={false}
            />

            {/* Cart and actions remain unchanged */}
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

            {/* Modal for Delete Confirmation */}
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, padding: 10 },
  header: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#222' },
  searchBar: {
    backgroundColor: '#f2f2f2', color: '#222',
    borderRadius: 10, padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  categoryBar: {
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 2,
    elevation: 2,
    zIndex: 2,
  },
  categoryButton: {
    backgroundColor: '#eee',
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedCategory: {
    backgroundColor: '#0080ff',
  },
  categoryText: {
    color: '#222',
    fontWeight: 'bold',
  },
  grid: {
    paddingBottom: 10,
    flexGrow: 1,
    paddingHorizontal: 0, // Remove extra padding to maximize card width
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    margin: CARD_MARGIN,
    width: CARD_WIDTH,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 0,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#eee',
  },
  noImage: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  noImageText: {
    color: '#888',
    fontWeight: 'bold',
  },
  cardDetails: {
    width: '100%',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  productCategory: { color: '#0080ff', fontWeight: 'bold', fontSize: 13, marginBottom: 2 },
  productName: { color: '#222', fontWeight: '700', fontSize: 16, marginBottom: 2, textAlign: 'center' },
  productPrice: { color: '#222', fontWeight: '600', fontSize: 15, marginBottom: 2 },
  productStock: { color: '#222', fontWeight: '600', fontSize: 13, marginBottom: 2 },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
  },
  deleteText: { color: '#fff', fontWeight: 'bold' },
  addToCartButton: {
    backgroundColor: '#00aa00',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  addToCartText: { color: '#fff', fontWeight: 'bold' },
  cartContainer: {
    backgroundColor: '#fafafa',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    maxHeight: 150,
  },
  cartTitle: { color: '#222', fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  emptyCart: { color: '#999', fontStyle: 'italic' },
  cartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cartItem: { color: '#222' },
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