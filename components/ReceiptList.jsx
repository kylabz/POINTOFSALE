import React, { useEffect, useState } from 'react';
import { fetchReceipts } from '../api/receiptService';

export default function ReceiptList() {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    fetchReceipts()
      .then(setReceipts)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Receipts</h2>
      {receipts.map(r => (
        <div key={r._id}>
          <p><strong>Customer:</strong> {r.customerName}</p>
          <p><strong>Date:</strong> {new Date(r.date).toLocaleString()}</p>
          <p><strong>Total:</strong> ${r.total}</p>
          <ul>
            {r.items.map((item, idx) => (
              <li key={idx}>
                {item.product} - {item.quantity} x ${item.price}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
