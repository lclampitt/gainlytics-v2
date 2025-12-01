import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function AuthForm({ isRegistering, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setBusy(true);

    try {
      if (isRegistering) {
        // Create account, then route to login per your functional reqs
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Optional: attach a query param so you can show a banner on the login page
        navigate('/auth?registered=1', { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Notify parent if it still listens, then go straight to dashboard
        onLogin?.();
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h3>{isRegistering ? 'Register' : 'Sign In'}</h3>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={busy}>
        {busy ? (isRegistering ? 'Creating…' : 'Signing in…') : (isRegistering ? 'Register' : 'Sign In')}
      </button>

      {message && <p style={{ color: 'white' }}>{message}</p>}
    </form>
  );
}

export default AuthForm;
