import './About.css';

export default function About() {
  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Hero Section */}
        <div className="page-hero">
          <h1 className="page-hero-title">About Biblioteka</h1>
          <div className="page-divider"></div>
          <p className="page-hero-subtitle">
            Your Next Great Read Awaits
          </p>
        </div>

        {/* Main Content */}
        <div className="page-content-card">
          <div className="page-content-inner">

            {/* Story Section */}
            <section className="content-section">
              <h2 className="section-title">Who We Are</h2>
              <div className="section-ornament">⬥ ⬥ ⬥</div>

              <p className="section-text">
                Biblioteka is more than just a bookstore — it’s a space where stories,
                ideas, and imagination come together. Founded by passionate readers,
                our mission is to connect people with books that inspire, educate,
                and entertain.
              </p>

              <p className="section-text">
                From timeless classics to modern bestsellers, we carefully curate
                our collection to ensure that every reader finds something meaningful.
                Whether you are a casual reader or a devoted bibliophile, Biblioteka
                is your literary home.
              </p>
            </section>

            {/* Mission Section */}
            <section className="content-section">
              <h2 className="section-title">Our Mission</h2>
              <div className="section-ornament">⬥ ⬥ ⬥</div>

              <div className="mission-grid">
                <div className="mission-item">
                  <div className="mission-icon">📖</div>
                  <h3 className="mission-item-title">Inspire Reading</h3>
                  <p className="mission-item-text">
                    Encourage a love for reading across all ages
                  </p>
                </div>

                <div className="mission-item">
                  <div className="mission-icon">🌍</div>
                  <h3 className="mission-item-title">Accessible Knowledge</h3>
                  <p className="mission-item-text">
                    Make books easily accessible to everyone, everywhere
                  </p>
                </div>

                <div className="mission-item">
                  <div className="mission-icon">⭐</div>
                  <h3 className="mission-item-title">Quality Selection</h3>
                  <p className="mission-item-text">
                    Offer carefully selected books from trusted authors and publishers
                  </p>
                </div>
              </div>
            </section>

            {/* Values Section */}
            <section className="content-section">
              <h2 className="section-title">Our Values</h2>
              <div className="section-ornament">⬥ ⬥ ⬥</div>

              <div className="values-list">
                <div className="value-item">
                  <span className="value-marker">⬥</span>
                  <div>
                    <strong>Passion</strong> — We believe books have the power to change lives
                  </div>
                </div>

                <div className="value-item">
                  <span className="value-marker">⬥</span>
                  <div>
                    <strong>Community</strong> — Supporting readers, writers, and learners
                  </div>
                </div>

                <div className="value-item">
                  <span className="value-marker">⬥</span>
                  <div>
                    <strong>Integrity</strong> — Honest recommendations and trusted quality
                  </div>
                </div>

                <div className="value-item">
                  <span className="value-marker">⬥</span>
                  <div>
                    <strong>Curiosity</strong> — Always exploring new ideas and stories
                  </div>
                </div>
              </div>
            </section>

            {/* Quote Section */}
            <section className="content-section quote-section">
              <div className="quote-wrapper">
                <div className="quote-mark">"</div>
                <p className="quote-text">
                  A reader lives a thousand lives before he dies.
                </p>
                <div className="quote-author">— George R.R. Martin</div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
