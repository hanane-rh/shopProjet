import './Footer.css';


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-column">
          <h3 className="footer-logo">BookStore</h3>
          <p>
            Discover books that inspire, educate, and entertain.
            Your next great read is just one click away.
          </p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/books">Shop</a></li>
            <li><a href="/about">About</a></li>
            
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <p>Email: contact@bookstore.com</p>
          <p>Phone: +213 00 00 00 00</p>
          <p>Algeria</p>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} BookStore — All rights reserved
      </div>
    </footer>
  );
}
