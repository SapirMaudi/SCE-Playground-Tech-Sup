import './ProductPage.css';
import { useEffect, useState, useContext } from 'react';
import api from '../services/api.js';
import '../App.css';
import { StoreContext } from '../store/StoreContext.jsx';
import { jwtDecode } from 'jwt-decode';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductPageUI from '../components/prodDetailsAndBuyButton.jsx';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { user, token } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProductById() {
      try {
        const response = await api.get(`/products/read-product/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error loading product', err);
      }
    }
    fetchProductById();
  }, [id]);
  console.log('Product data from DB:', product);

  async function deleteProductById() {
    const confirmDelete = window.confirm('Are you sure you want to delete?');
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/products/delete-product/${id}`);
      alert('Product deleted successfully.');
      navigate('/products');
    } catch (err) {
      console.error('Error loading product', err);
      alert('Error: Product deletion failed.');
    }
  }

  function EditProduct() {
    navigate(`/products/update-product/${id}`);
  }

  function ProductLeads() {
    navigate(`/products/${id}/leads`);
  }

  if (!product)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </div>
    );

  return (
    <div className="product-page">
      <div className="product-container">
        <ProductPageUI
          product={product}
          user={user}
          onEdit={EditProduct}
          onDelete={deleteProductById}
          onViewLeads={ProductLeads}
        />
      </div>
    </div>
  );
}
