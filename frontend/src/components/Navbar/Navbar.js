import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useContext, useState, useRef, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import "./Navbar.css";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { cartItems, removeFromCart, getTotalPrice } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCartOpen]);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-logo"><h3>Biblioteka</h3></div>

      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/books">Shop</Link></li>
        <li><Link to="/category/romans">Categories</Link></li> {/* link corrected */}
      </ul>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <div className="cart-dropdown-wrapper" ref={cartRef}>
              <button className="cart-toggle-btn" onClick={toggleCart}>
                🛒 Cart {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
              </button>

              {isCartOpen && (
                <div className="cart-dropdown">
                  <div className="cart-dropdown-inner">
                    <div className="cart-dropdown-header">
                      <h3 className="cart-dropdown-title">My Cart</h3>
                      <div className="cart-divider"></div>
                    </div>

                    <div className="cart-dropdown-content">
                      {cartItems.length === 0 ? (
                        <div className="cart-empty">
                          <p>Your cart is empty</p>
                          <div className="cart-empty-icon">📚</div>
                        </div>
                      ) : (
                        <>
                          <ul className="cart-items-list">
                            {cartItems.map(item => (
                              <li key={item.id} className="cart-item">
                                <div className="cart-item-info">
                                  <span className="cart-item-name">{item.name}</span>
                                  <span className="cart-item-details">${item.price} × {item.quantity}</span>
                                </div>
                                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>✕</button>
                              </li>
                            ))}
                          </ul>

                          <div className="cart-dropdown-footer">
                            <div className="cart-divider"></div>
                            <div className="cart-total">
                              <span className="cart-total-label">Total</span>
                              <span className="cart-total-price">${getTotalPrice().toFixed(2)}</span>
                            </div>
                            <Link to="/payment" className="cart-view-btn" onClick={() => setIsCartOpen(false)}>Payment</Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Sign in</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
