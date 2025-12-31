import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import './Payment.css';

export default function Payment() {
  const { cartItems, getTotalPrice, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'delivery'
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Card payment fields
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    
    // Delivery info (required for both payment methods)
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    // Validate delivery info (required for both methods)
    if (!formData.fullName || !formData.address || !formData.city || 
        !formData.postalCode || !formData.phone || !formData.email) {
      setError('Please fill in all delivery information');
      return false;
    }

    // Validate card info only if paying by card
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
      const response = await fetch("http://127.0.0.1:8000/api/shop/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          total: getTotalPrice(),
          payment_method: paymentMethod,
          delivery_info: {
            full_name: formData.fullName,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            email: formData.email
          },
          ...(paymentMethod === 'card' && {
            card_info: {
              card_number: formData.cardNumber,
              card_name: formData.cardName,
              expiry_date: formData.expiryDate,
              cvv: formData.cvv
            }
          })
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Payment failed");
      }

      // Payment / order successful
      const message = paymentMethod === 'delivery' 
        ? 'Order created successfully! You will pay on delivery.'
        : 'Order created successfully! Payment processed.';
      
      alert(message);
      clearCart();
      navigate("/success");
    } catch (err) {
      setError(err.message);
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

          {/* Order Summary */}
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

          {/* Payment Method Selection */}
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

          {error && <div className="payment-error">{error}</div>}

          <form className="payment-form" onSubmit={handlePayment}>
            {/* Card Information - Only show if paying by card */}
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
                    placeholder="1234 5678 9012 3456"
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

            {/* Delivery Information - Required for both methods */}
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

            {/* Submit Button */}
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

            {/* Security Note */}
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