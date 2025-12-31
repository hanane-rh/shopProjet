// src/pages/Books.jsx
import { useEffect, useState } from 'react';
import { getAllProducts } from '../services/productService';
import ProductCard from '../components/ProductCard/ProductCard';
import './Books.css';

export default function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getAllProducts();
        setBooks(data.results);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="books-page">
      <div className="books-header">
        <h2 className="books-title">All Books</h2>
      </div>
      
      <div className="books-grid">
        {books.map(book => (
          <ProductCard key={book.id} product={book} />
        ))}
      </div>
    </div>
  );
}