import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Неверный email или пароль"
          : error.message,
      );
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-decoration" aria-hidden="true">
        <span
          className="auth-coin"
          style={{
            left: "12%",
            top: "18%",
            fontSize: 28,
            animationDelay: "0s",
          }}
        >
          ₽
        </span>
        <span
          className="auth-coin"
          style={{
            left: "84%",
            top: "12%",
            fontSize: 22,
            animationDelay: "1.2s",
          }}
        >
          $
        </span>
        <span
          className="auth-coin"
          style={{
            left: "78%",
            top: "72%",
            fontSize: 26,
            animationDelay: "2s",
          }}
        >
          ₽
        </span>
        <span
          className="auth-coin"
          style={{
            left: "18%",
            top: "82%",
            fontSize: 20,
            animationDelay: "0.6s",
          }}
        >
          $
        </span>
      </div>

      <div className="auth-card">
        <div className="auth-logo">💰</div>
        <h2>Семейный бюджет</h2>
        <p className="auth-subtitle">Войдите, чтобы продолжить работу</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Пароль</label>
            <div className="auth-password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="auth-show-password"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <span className="auth-error-icon">⚠</span>
              {error}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner" />
                Вход…
              </>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        <p className="auth-hint"></p>
      </div>
    </div>
  );
}
