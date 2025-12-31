import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "./Login.css";
export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password2) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await register(form);
      navigate("/login");
    } catch {
      setError("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card register-card">
        <div className="login-card-inner">
          <h2 className="login-title">Inscription</h2>
          
          <div className="login-divider"></div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-form">
            <div className="input-group">
              <label className="input-label" htmlFor="username">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                name="username"
                className="login-input"
                placeholder="Choisissez un nom d'utilisateur"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="email">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="login-input"
                placeholder="Entrez votre email"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="login-input"
                placeholder="Créez un mot de passe"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password2">
                Confirmation
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                className="login-input"
                placeholder="Confirmez votre mot de passe"
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="button"
              className="login-button"
              onClick={handleSubmit}
            >
              S'inscrire
            </button>
          </div>

          <div className="login-footer">
            Déjà inscrit ? <a href="/login">Se connecter</a>
          </div>
        </div>
      </div>
    </div>
  );
}