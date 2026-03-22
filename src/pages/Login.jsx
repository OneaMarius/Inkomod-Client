// File: Client/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import Button from '../components/Button';
import styles from '../styles/Auth.module.css';
import { GAME_CONFIG } from '../config/gameConfig';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const loginAction = useAuthStore((state) => state.login);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password,
            });

            if (response.status === 200) {
                const { user, token } = response.data;
                loginAction(user, token);
                navigate('/main-menu');
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || 'Server error. Login failed.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
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
                        type='email'
                        placeholder='Email Address'
                        name='email'
                        value={formData.email}
                        onChange={onChange}
                        autoComplete='email'
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <input
                        type='password'
                        placeholder='Password'
                        name='password'
                        value={formData.password}
                        onChange={onChange}
                        autoComplete='current-password'
                        required
                    />
                </div>

                {error && <p className={styles.errorText}>{error}</p>}

                <Button type='submit' disabled={isLoading}>
                    {isLoading ? 'Entering Realm...' : 'Enter the Realm'}
                </Button>
            </form>

            <div className={styles.authFooter}>
                <p>New to the old days?</p>
                <Link to='/register' className={styles.goldLink}>
                    Create Account
                </Link>
            </div>

            <div className="versionText">
                v. {GAME_CONFIG.displayVersion}
            </div>
        </div>
    );
};

export default Login;