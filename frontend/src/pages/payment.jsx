import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";
import './Payment.css';

export default function Payment() {
  const { cartItems, getTotalPrice, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const navigate = useNavigate();

  const initialFormData = {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    email: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.address || !formData.city || 
        !formData.postalCode || !formData.phone || !formData.email) {
      setError('Please fill in all delivery information');
      return false;
    }

    if (paymentMethod === 'card') {
      if (!formData.cardNumber || formData.cardNumber.length < 16) {
        setError('Invalid card number');
        return false;
      }
      if (!formData.cardName) {
        setError('Cardholder name is required');
        return false;
      }
      if (!formData.expiryDate || !formData.cvv) {
        setError('Expiry date and CVV are required');
        return false;
      }
    }

    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("=== DÉBUT DU PAIEMENT ===");
      console.log("1. Cart Items:", cartItems);
      
      // ÉTAPE 1 : Synchroniser le panier avec le backend
      console.log("2. Syncing cart with backend...");
      
      // Vider le panier backend
      try {
        await api.delete("shop/cart/clear/");
        console.log("   ✓ Cart cleared");
      } catch (err) {
        console.log("   ℹ No cart to clear or error:", err.message);
      }

      // Ajouter tous les items du panier frontend au backend
      for (const item of cartItems) {
        console.log(`   Adding item: ${item.name} (ID: ${item.id}) x${item.quantity}`);
        await api.post("shop/cart/add_item/", {
          product_id: item.id,
          quantity: item.quantity
        });
      }

      console.log("   ✓ Cart synced successfully!");

      // ÉTAPE 2 : Préparer les données de commande
      const orderData = {
        payment_method: paymentMethod,
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
      };

      // Ajouter les infos carte si paiement par carte
      if (paymentMethod === 'card') {
        orderData.card_number = formData.cardNumber;
        orderData.card_expiry = formData.expiryDate;
        orderData.card_cvv = formData.cvv;
      }

      console.log("3. Order Data:", orderData);

      // ÉTAPE 3 : Créer la commande
      console.log("4. Creating order...");
      const response = await api.post("shop/orders/create_order/", orderData);

      console.log("5. ✓ Order created:", response.data);
      console.log("=== PAIEMENT RÉUSSI ===");

      // ÉTAPE 4 : Succès !
      const message = paymentMethod === 'delivery' 
        ? 'Order created successfully! You will pay on delivery.'
        : 'Order created successfully! Payment processed.';
      
      setSuccess(message);
      
      // Clear cart
      clearCart();
      
      // Reset form fields
      setFormData(initialFormData);
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (err) {
      console.error("=== ERREUR DE PAIEMENT ===");
      console.error("Error object:", err);
      
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response data:", err.response.data);
        console.error("Headers:", err.response.headers);
        
        const errorData = err.response.data;
        let errorMsg = "Payment failed";
        
        // Afficher les erreurs de validation détaillées
        if (typeof errorData === 'object' && errorData !== null) {
          const errorMessages = [];
          
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              errorMessages.push(`${field}: ${messages}`);
            } else if (typeof messages === 'object') {
              errorMessages.push(`${field}: ${JSON.stringify(messages)}`);
            }
          }
          
          if (errorMessages.length > 0) {
            errorMsg = errorMessages.join('\n');
          }
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
        
        console.error("Parsed error message:", errorMsg);
        setError(errorMsg);
        
      } else if (err.request) {
        console.error("No response received");
        console.error("Request:", err.request);
        setError("Cannot reach the server. Is your backend running on http://127.0.0.1:8000?");
      } else {
        console.error("Error setting up request:", err.message);
        setError(err.message || "Payment failed");
      }
      
      console.error("=========================");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="payment-container">
        <div className="payment-card empty-cart">
          <h2 className="payment-title">Your Cart is Empty</h2>
          <p className="empty-cart-text">Add some books to your cart before proceeding to payment</p>
          <button className="hero-btn" onClick={() => navigate('/books')}>
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-card-inner">
          <h2 className="payment-title">Secure Payment</h2>
          <div className="payment-divider"></div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            {cartItems.map((item, index) => (
              <p key={index}>
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </p>
            ))}
            <p className="total">
              <span>Total</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </p>
          </div>

          <div className="payment-method-section">
            <h3 className="form-section-title">Payment Method</h3>
            <div className="payment-methods">
              <label className={`payment-method-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <span className="method-icon">💳</span>
                  <span className="method-text">Credit/Debit Card</span>
                </div>
              </label>

              <label className={`payment-method-option ${paymentMethod === 'delivery' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="delivery"
                  checked={paymentMethod === 'delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <span className="method-icon">📦</span>
                  <span className="method-text">Cash on Delivery</span>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="payment-error" style={{whiteSpace: 'pre-line'}}>
              {error}
            </div>
          )}

          {success && (
            <div className="payment-success">
              ✓ {success}
            </div>
          )}

          <form className="payment-form" onSubmit={handlePayment}>
            {paymentMethod === 'card' && (
              <div className="form-section">
                <h3 className="form-section-title">Card Information</h3>
                
                <div className="input-group">
                  <label className="input-label">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234567890123456"
                    maxLength="16"
                    className="payment-input"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    placeholder="Full name on card"
                    className="payment-input"
                    required
                  />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label className="input-label">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="payment-input"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="3"
                      className="payment-input"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="form-section">
              <h3 className="form-section-title">Delivery Information</h3>
              
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="payment-input"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, number, apartment..."
                  className="payment-input"
                  required
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="payment-input"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="12345"
                    className="payment-input"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="payment-select"
                  required
                >
                  <option value="">Select a country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="ES">Spain</option>
                  <option value="IT">Italy</option>
                  <option value="DZ">Algeria</option>
                  <option value="MA">Morocco</option>
                  <option value="TN">Tunisia</option>
                </select>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    className="payment-input"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="payment-input"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="payment-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : 
                paymentMethod === 'delivery' 
                  ? `Place Order - Pay $${getTotalPrice().toFixed(2)} on Delivery`
                  : `Pay $${getTotalPrice().toFixed(2)} Now`
              }
            </button>

            <div className="security-note">
              {paymentMethod === 'card' 
                ? '🔒 Your payment information is secure and encrypted'
                : '📦 You will pay in cash when your order is delivered'
              }
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}