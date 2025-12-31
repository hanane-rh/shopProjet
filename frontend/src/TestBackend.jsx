import { useEffect, useState } from 'react';
import { getAllProducts, getCategories } from './services/productService';

export default function TestBackend() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodsData = await getAllProducts();
        // prend uniquement le tableau results
        setProducts(prodsData.results);

        const catsData = await getCategories();
        // si categories renvoie directement un tableau
        setCategories(catsData.results || catsData); 

      } catch (err) {
        console.error('Erreur backend complète :', err);
        setError('Impossible de charger les données');
      }
    };

    fetchData();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Test Backend</h2>
      <h3>Produits ({products.length})</h3>
      <ul>
        {products.map(p => (
          <li key={p.id}>{p.name} - ${p.price}</li>
        ))}
      </ul>

      <h3>Catégories ({categories.length})</h3>
      <ul>
        {categories.map(c => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}
