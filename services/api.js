import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReceiptScreen = () => {
  const [receipts, setReceipts] = useState([]);  // Initial state is an empty array

  useEffect(() => {
    // Fetch receipts from backend
    axios.get('http://localhost:5000/api/receipts')
      .then((response) => {
        setReceipts(response.data || []);  // Ensure receipts is always an array
      })
      .catch((err) => {
        console.error('Error fetching receipts:', err);
      });
  }, []);

  return (
    <div>
      <h2>Receipts</h2>
      {Array.isArray(receipts) && receipts.length > 0 ? (
        receipts.map((receipt) => (
          <div key={receipt._id}>
            <h3>{receipt.product}</h3>
            <p>Quantity: {receipt.quantity}</p>
            <p>Total Price: {receipt.totalPrice}</p>
          </div>
        ))
      ) : (
        <p>No receipts available.</p>  // Display a message if there are no receipts
      )}
    </div>
  );
};

export default ReceiptScreen;
