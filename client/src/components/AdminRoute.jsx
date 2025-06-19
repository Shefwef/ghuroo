import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await fetch('/api/admin/test', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          navigate('/admin/login');
        }
      } catch (err) {
        navigate('/admin/login');
      }
    };
    
    verifyAdmin();
  }, [navigate]);

  return children;
}