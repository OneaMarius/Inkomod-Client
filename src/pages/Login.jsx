import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import styles from '../styles/Auth.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Logica de autentificare va fi legata de API aici
    console.log('Logging in with:', formData);
  };

  return (
    <div className={`screen-container ${styles.authPage}`}>
      <div className={styles.authHeader}>
        <h1>INKoMOD</h1>
        <p>Welcome Back, Knight</p>
      </div>

      <form className={styles.authForm} onSubmit={onSubmit}>
        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <Button type="submit">Enter the Realm</Button>
      </form>

      <div className={styles.authFooter}>
        <p>New to the old days?</p>
        <Link to="/register" className={styles.goldLink}>Create Account</Link>
      </div>
    </div>
  );
};

export default Login;