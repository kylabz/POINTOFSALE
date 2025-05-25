import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../api/productService';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Products</h2>
      {products.map(p => (
        <div key={p._id}>
          <h3>{p.name}</h3>
          <img src={`http://localhost:3000${p.image}`} alt={p.name} width={100} />
          <p>Price: ${p.price}</p>
          <p>Quantity: {p.quantity}</p>
        </div>
      ))}
    </div>
  );
}
