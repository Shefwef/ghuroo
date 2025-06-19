import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';


export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken(true); // force refresh

      
      const response = await fetch('/api/admin/auth/admin/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
  
      // First check if response exists and is OK
      if (!response) {
        throw new Error('No response from server');
      }
  
      // Check for server errors
      if (!response.ok) {
        const errorData = await response.text(); // Try to read as text first
        try {
          // If it's JSON, parse it
          const jsonData = JSON.parse(errorData);
          throw new Error(jsonData.message || 'Admin authentication failed');
        } catch {
          // If not JSON, use raw text
          throw new Error(errorData || 'Admin authentication failed');
        }
      }
  
      // If response is OK, parse as JSON
      const data = await response.json();
      if (data.success) {
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Admin authentication failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="admin-login-container">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}