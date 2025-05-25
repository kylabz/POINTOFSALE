import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';

type CartItem = {
  name: string;
  price: number;
  quantity: number;
};

export default function ReceiptScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerType, setCustomerType] = useState('Dine-in');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadCart = async () => {
      const storedCart = await AsyncStorage.getItem('receiptCart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    };
    loadCart();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const currentDateTime = new Date().toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const handlePayment = () => {
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < total) {
      setError('Insufficient amount.');
      setChange(null);
      setSuccessMessage(null);
    } else {
      setError(null);
      setChange(paid - total);
      setSuccessMessage(null);
    }
  };

  const handlePrint = async () => {
    if (!customerName.trim()) {
      Alert.alert('Validation Error', 'Please enter a customer name before printing.');
      return;
    }
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Cart is empty, cannot print receipt.');
      return;
    }

    // Generate itemized HTML list for receipt
    const itemsHtml = cart
      .map(
        (item) =>
          `<tr><td>${item.name}</td><td style="text-align:center;">${item.quantity}</td><td style="text-align:right;">₱${(item.price * item.quantity).toFixed(2)}</td></tr>`
      )
      .join('');

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 16px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border-bottom: 1px solid #ddd; padding: 8px; }
            th { text-align: left; }
            .info { margin-bottom: 12px; }
            .label { font-weight: bold; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <h2>🧾 POS Receipt</h2>
          <div class="info"><span class="label">Date & Time:</span> ${currentDateTime}</div>
          <div class="info"><span class="label">Customer Name:</span> ${customerName}</div>
          <div class="info"><span class="label">Order Type:</span> ${customerType}</div>
          <table>
            <thead>
              <tr><th>Product</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th></tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="total">Total: ₱${total.toFixed(2)}</div>
          <div class="info"><span class="label">Amount Paid:</span> ₱${parseFloat(amountPaid).toFixed(2)}</div>
          <div class="info"><span class="label">Change:</span> ₱${change?.toFixed(2)}</div>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({ html });

      // Save receipt to backend
      await fetch('http://192.168.1.100:3000/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerType,
          items: cart.map((item) => ({
            product: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total,
          date: new Date(),
        }),
      });

      // Clear cart and inputs on success
      await AsyncStorage.removeItem('receiptCart');
      setCart([]);
      setAmountPaid('');
      setChange(null);
      setError(null);
      setCustomerName('');
      setCustomerType('Dine-in');
      setSuccessMessage('Receipt printed and saved successfully!');
    } catch (error) {
      console.error('Failed to save receipt:', error);
      Alert.alert('Error', 'Failed to save receipt. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background/fastfood.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Receipt</Text>
        <Text style={styles.datetime}>{currentDateTime}</Text>

        <Text style={styles.inputLabel}>Customer Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter customer name"
          placeholderTextColor="#aaa"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={styles.inputLabel}>Order Type:</Text>
        <View style={styles.orderTypeContainer}>
          <Button
            title="Dine-in"
            onPress={() => setCustomerType('Dine-in')}
            color={customerType === 'Dine-in' ? 'green' : 'gray'}
          />
          <Button
            title="Take-out"
            onPress={() => setCustomerType('Take-out')}
            color={customerType === 'Take-out' ? 'green' : 'gray'}
          />
        </View>

        {cart.length === 0 ? (
          <Text style={styles.empty}>Cart is empty.</Text>
        ) : (
          cart.map((item, i) => (
            <Text key={i} style={styles.item}>
              {item.name} x {item.quantity} = ₱
              {(item.price * item.quantity).toFixed(2)}
            </Text>
          ))
        )}

        <Text style={styles.total}>Total: ₱{total.toFixed(2)}</Text>

        <TextInput
          style={styles.input}
          placeholder="Amount Paid"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={amountPaid}
          onChangeText={setAmountPaid}
        />
        <Button title="Calculate Change" onPress={handlePayment} />

        {error && <Text style={styles.error}>{error}</Text>}
        {change !== null && (
          <Text style={styles.change}>Change: ₱{change.toFixed(2)}</Text>
        )}
        {successMessage && <Text style={styles.success}>{successMessage}</Text>}

        <Button
          title="Print Receipt"
          onPress={handlePrint}
          disabled={change === null || cart.length === 0 || !customerName.trim()}
        />
        <View style={{ height: 10 }} />
        <Button title="Back to POS" onPress={() => router.back()} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flexGrow: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  datetime: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  item: {
    fontSize: 16,
    color: '#eee',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f0',
    marginVertical: 10,
  },
  input: {
    width: '100%',
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 15,
  },
  error: {
    color: 'red',
    marginVertical: 5,
  },
  change: {
    color: '#0f0',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  success: {
    color: '#0ff',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  empty: {
    color: '#bbb',
    fontStyle: 'italic',
    marginVertical: 10,
  },
});
