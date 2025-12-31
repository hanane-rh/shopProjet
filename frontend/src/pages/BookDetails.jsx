// src/pages/BookDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './BookDetails.css';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch details du livre
  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/shop/products/${id}/`);
        if (!response.ok) throw new Error('Failed to fetch book details');
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(book);
    alert('Book added to cart!');
  };

  if (loading) {
    return (
      <div className="book-details-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-details-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-details-container">
        <p className="not-found-message">Book not found</p>
      </div>
    );
  }

  return (
    <div className="book-details-container">
      <Link to="/books" className="back-link">
        ← Back to Books
      </Link>

      <div className="book-details">
        <div className="book-image">
          <img src={book.image} alt={book.name} />
        </div>

        <div className="book-info">
          <h2>{book.name}</h2>
          
          <p>{book.description}</p>
          
          <p className="price-info">
            <strong>Price:</strong>
            ${parseFloat(book.price).toFixed(2)}
          </p>
          
          <p className="stock-info">
            <strong>Stock:</strong> {book.stock} available
          </p>
          
          <button
            onClick={handleAddToCart}
            className="book-add-to-cart"
            disabled={book.stock === 0}
          >
            {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}