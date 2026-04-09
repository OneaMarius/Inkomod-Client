// File: Client/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import styles from '../styles/Auth.module.css';
import { GAME_CONFIG } from '../config/gameConfig';
import { getStandardErrorMessage } from '../utils/ErrorHandler';
import Logo from '../components/Logo';

const Register = () => {
	const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const onChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		setIsLoading(true);

		try {
			const response = await api.post('/auth/register', { username: formData.username, email: formData.email, password: formData.password });

			if (response.status === 201) {
				navigate('/login');
			}
		} catch (err) {
			const standardizedError = getStandardErrorMessage(err);
			setError(standardizedError);
		} finally {
			setIsLoading(false);
		}
	};

	return (
<div className={`screen-container ${styles.authPage}`}>
            <div className={styles.authHeader}>
                {/* Componenta reutilizabilă (doar imaginea) */}
                <Logo />
                
                {/* Textul original rămâne aici, în afara componentei Logo */}
                <p>Join the Medieval Days</p>
            </div>

            <form
                className={styles.authForm}
                onSubmit={onSubmit}
            >
                <div className={styles.inputGroup}>
                    <input
                        type='text'
                        placeholder='Username'
                        name='username'
                        value={formData.username}
                        onChange={onChange}
                        autoComplete='off'
                        required
                    />
                </div>
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
                        autoComplete='new-password'
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <input
                        type='password'
                        placeholder='Confirm Password'
                        name='confirmPassword'
                        value={formData.confirmPassword}
                        onChange={onChange}
                        autoComplete='new-password'
                        required
                    />
                </div>

                {error && (
                    <div className='system-error-box'>
                        <span className='error-icon'>⚠️</span>
                        {error}
                    </div>
                )}

                <Button
                    type='submit'
                    disabled={isLoading}
                >
                    {isLoading ? 'Forging Knight...' : 'Create Knight'}
                </Button>
            </form>

            <div className={styles.authFooter}>
                <p>Already a member?</p>
                <Link
                    to='/login'
                    className={styles.goldLink}
                >
                    Login Here
                </Link>
            </div>
            <div className='versionText'>v. {GAME_CONFIG.displayVersion}</div>
        </div>
    );
};

export default Register;
