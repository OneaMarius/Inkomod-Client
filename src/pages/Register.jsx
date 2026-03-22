import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import styles from '../styles/Auth.module.css';
import { GAME_CONFIG } from '../config/gameConfig';

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
			setError('Passwords do not match');
			return;
		}

		setIsLoading(true);

		try {
			// Sending data to the backend POST /api/auth/register
			const response = await api.post('/auth/register', { username: formData.username, email: formData.email, password: formData.password });

			if (response.status === 201) {
				// Redirect to login after successful account creation
				navigate('/login');
			}
		} catch (err) {
			// Extract the error message from the backend response, if available
			const errorMessage = err.response?.data?.message || 'Server error. Registration failed.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={`screen-container ${styles.authPage}`}>
			<div className={styles.authHeader}>
				<h1>INKoMOD</h1>
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

				{error && <p className={styles.errorText}>{error}</p>}

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
