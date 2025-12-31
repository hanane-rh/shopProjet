import { useEffect, useState } from 'react';
import { getAllProducts } from '../services/productService';

import Footer from './Footer';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
   const [currentQuote, setCurrentQuote] = useState(0);
   const [categories, setCategories] = useState([]);
  
 
  

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getAllProducts();
        setFeatured(data.results.filter(p => p.is_featured));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getAllProducts();
        setFeatured(data.results.filter(p => p.is_featured).slice(0, 6));
        
        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(data.results.map(p => p.category_name))].slice(0, 4);
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
 <div className="hero-content">
  {/* Texte à gauche */}
  <div className="hero-text">
    <h1 className="hero-title animate-slide-fade">Your Next Great Read Awaits</h1>
    <p className="hero-subtitle animate-slide-fade delay-1">
      Step into a curated collection of books that inspire, educate, and entertain.
    </p>
    <p className="hero-description animate-slide-fade delay-2">
      From timeless classics to modern bestsellers, find stories that stay with you.
    </p>

    <button className="hero-btn" onClick={() => window.location.href='/books'}>
      Shop Now
    </button>
  </div>

  {/* Image à droite */}
  <div className="hero-image-container">
    <img 
      src="_A_group_of__books_without_background_suitable_for_use_in_design__stacked_in_a_disorganized_way-removebg-preview.png"
      alt="Stack of books" 
      className="hero-image"
    />
  </div>
</div>

      </section>  
      <Footer />
    </div>
  );
}