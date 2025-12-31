import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login'); // redirige si non connecté
      return;
    }
    addToCart(product);
    
  };

  return (
    <div className="product-card">
  <Link to={`/books/${product.slug}`} className="product-link">
    
    <div className="product-image-wrapper">
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />
    </div>

    <h3 className="product-name">{product.name}</h3>
  </Link>

  
  <p className="product-price">Prix : ${product.price}</p>
  
  <button className="add-to-cart-btn" onClick={handleAddToCart}>
    Add it
  </button>
</div>

  );
}
