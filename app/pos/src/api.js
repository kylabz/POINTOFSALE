// src/api.js

export async function fetchProducts() {
  // Example: fetch from AsyncStorage or backend
  // return await AsyncStorage.getItem('products');
  return [{ name: 'Burger', price: 99 }];
}

export async function addProduct(product) {
  // Example: add to AsyncStorage or backend
  // ...your logic here...
  return true;
}