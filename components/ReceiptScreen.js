import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';

const ReceiptsScreen = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch receipts data from your backend
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/receipts');
        const data = await response.json();
        setReceipts(data);
      } catch (error) {
        console.error('Error fetching receipts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  // Handle the loading state or no data
  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (receipts.length === 0) {
    return <Text>No receipts found.</Text>;
  }

  return (
    <FlatList
      data={receipts}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View>
          <Text>Product: {item.product}</Text>
          <Text>Quantity: {item.quantity}</Text>
          <Text>Total Price: {item.totalPrice}</Text>
        </View>
      )}
    />
  );
};

export default ReceiptsScreen;
