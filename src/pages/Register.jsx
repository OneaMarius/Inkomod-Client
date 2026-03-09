import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import styles from '../styles/Auth.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    console.log('Registering:', formData);
  };

  return (
    <div className={`screen-container ${styles.authPage}`}>
      <div className={styles.authHeader}>
        <h1>INKoMOD</h1>
        <p>Join the Medieval Days</p>
      </div>

      <form className={styles.authForm} onSubmit={onSubmit}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Username"
            name="username"
            onChange={onChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            onChange={onChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={onChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            onChange={onChange}
            required
          />
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <Button type="submit">Create Knight</Button>
      </form>

      <div className={styles.authFooter}>
        <p>Already a member?</p>
        <Link to="/login" className={styles.goldLink}>Login Here</Link>
      </div>
    </div>
  );
};

export default Register;