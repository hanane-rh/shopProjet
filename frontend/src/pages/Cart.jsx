// src/pages/Cart.jsx
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cartItems, removeFromCart, getTotalPrice } = useContext(CartContext);

  if (cartItems.length === 0) return <p>Your cart is empty.</p>;

  return (
    <div>
      <h2>My Cart</h2>
      <ul>
        {cartItems.map(item => (
          <li key={item.id}>
            {item.name} - ${item.price} x {item.quantity}
            <button onClick={() => removeFromCart(item.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
      <h3>Total : ${getTotalPrice()}</h3>
    </div>
  );
}
