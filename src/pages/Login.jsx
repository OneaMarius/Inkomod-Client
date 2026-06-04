// File: Client/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import Button from '../components/Button';
import styles from '../styles/Auth.module.css';
import { GAME_CONFIG } from '../config/gameConfig';
import { getStandardErrorMessage } from '../utils/ErrorHandler';
import Logo from '../components/Logo';
import VideoTransition from '../components/VideoTransition'; // 1. Import the transition component

const Login = () => {
	const [formData, setFormData] = useState({ email: '', password: '' });
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// 2. Add state to control video display
	const [showTransition, setShowTransition] = useState(false);

	// Password visibility state
	const [showPassword, setShowPassword] = useState(false);

	const navigate = useNavigate();
	const loginAction = useAuthStore((state) => state.login);

	const onChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			const response = await api.post('/auth/login', { email: formData.email, password: formData.password });

			if (response.status === 200) {
				const { user, token } = response.data;
				loginAction(user, token);

				// 3. Start video instead of instant navigation
				setShowTransition(true);
			}
		} catch (err) {
			const standardizedError = getStandardErrorMessage(err);
			setError(standardizedError);
			setIsLoading(false); // Reset loading only on error
		}
	};

	// 4. Function called from inside the video when transition point is reached
	const handleTransitionPoint = () => {
		navigate('/main-menu');
	};

	return (
		<>
			{/* Display transition ONLY if showTransition is true */}
			{showTransition && (
				<VideoTransition
					onTransitionPoint={handleTransitionPoint}
					// onComplete is no longer necessary because Maps destroys the current screen
				/>
			)}

			<div className={`screen-container ${styles.authPage}`}>
				<div className={styles.authHeader}>
					{/* Replace text with Logo component */}
					<Logo />

					{/* Original text remains unchanged */}
					<p>Welcome Back, Knight</p>
				</div>

				<form
					className={styles.authForm}
					onSubmit={onSubmit}
				>
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

					<div
						className={styles.inputGroup}
						style={{ position: 'relative' }}
					>
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder='Password'
							name='password'
							value={formData.password}
							onChange={onChange}
							autoComplete='current-password'
							required
							style={{ paddingRight: '40px' }}
						/>
						<button
							type='button'
							onClick={togglePasswordVisibility}
							style={{
								position: 'absolute',
								right: '10px',
								top: '50%',
								transform: 'translateY(-50%)',
								background: 'none',
								border: 'none',
								color: '#6b7280',
								cursor: 'pointer',
								padding: '0',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{showPassword ? (
								<svg
									width='20'
									height='20'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'></path>
									<line
										x1='1'
										y1='1'
										x2='23'
										y2='23'
									></line>
								</svg>
							) : (
								<svg
									width='20'
									height='20'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'></path>
									<circle
										cx='12'
										cy='12'
										r='3'
									></circle>
								</svg>
							)}
						</button>
					</div>

					{error && (
						<div className='system-error-box'>
							<span className='error-icon'>!</span>
							{error}
						</div>
					)}

					<Button
						type='submit'
						disabled={isLoading || showTransition} // Disable button during animation
					>
						{isLoading && !showTransition ? 'Entering Realm...' : 'Enter the Realm'}
					</Button>
				</form>

				<div className={styles.authFooter}>
					<p>New to the old days?</p>
					<Link
						to='/register'
						className={styles.goldLink}
					>
						Create Account
					</Link>
				</div>

				<div className='versionText'>v. {GAME_CONFIG.displayVersion}</div>

				<div style={{ marginTop: '10px', textAlign: 'center', zIndex: 10 }}>
					<Link
						to='/privacy-policy'
						style={{ fontSize: '0.75rem', color: '#6b7280', textDecoration: 'none', letterSpacing: '1px' }}
					>
						Privacy Policy
					</Link>
				</div>
			</div>
		</>
	);
};

export default Login;
