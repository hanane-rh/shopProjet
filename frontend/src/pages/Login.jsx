import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError("Identifiants incorrects");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card-inner">
          <h2 className="login-title">Connexion</h2>
          
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
                className="login-input"
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="button"
              className="login-button"
              onClick={handleSubmit}
            >
              Se connecter
            </button>
          </div>

          <div className="login-footer">
            Pas encore de compte ? <a href="/register">Créer un compte</a>
          </div>
        </div>
      </div>
    </div>
  );
}