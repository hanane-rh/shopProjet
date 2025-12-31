import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard/ProductCard";
import './category.css';

export default function Category() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState({ results: [] });
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/shop/categories/");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products for selected category
  useEffect(() => {
    if (!slug) return;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setError(null);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/shop/products/by_category/?slug=${slug}`
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setCategory(data.category);
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [slug]);

  if (loadingCategories) {
    return (
      <div className="category-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="category-container">
      {/* Titre principal */}
      <h2 className="category-main-title">Browse by Category</h2>
      <div className="title-divider"></div>

      {/* Liste des catégories */}
      <ul className="categories-list">
        {categories.results.map(cat => (
          <li key={cat.id}>
            <button
              className={`category-button ${slug === cat.slug ? 'active' : ''}`}
              onClick={() => navigate(`/category/${cat.slug}`)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Section des produits */}
      {slug ? (
        <div className="products-section">
          {loadingProducts ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <p className="no-products-message">No products found in this category.</p>
          ) : (
            <>
              {/* En-tête de catégorie */}
              <div className="category-header">
                <h3 className="category-title">{category?.name}</h3>
                <p className="category-description">{category?.description}</p>
              </div>

              {/* Grille de produits utilisant ProductCard */}
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="select-category-message">
          Please select a category to see products.
        </p>
      )}
    </div>
  );
}