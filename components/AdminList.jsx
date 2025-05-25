import React, { useEffect, useState } from 'react';
import { fetchAdmins } from '../api/adminService';

export default function AdminList() {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetchAdmins()
      .then(setAdmins)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Admins</h2>
      {admins.map(a => (
        <div key={a._id}>
          <p><strong>Username:</strong> {a.username}</p>
          <p><strong>Email:</strong> {a.email}</p>
        </div>
      ))}
    </div>
  );
}
