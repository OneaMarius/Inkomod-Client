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
import VideoTransition from '../components/VideoTransition'; // <-- 1. Importăm componenta de tranziție

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // <-- 2. Adăugăm starea pentru a controla afișarea video-ului
    const [showTransition, setShowTransition] = useState(false); 

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
            const response = await api.post('/auth/login', { email: formData.email, password: formData.password });

            if (response.status === 200) {
                const { user, token } = response.data;
                loginAction(user, token);
                
                // <-- 3. În loc de navigate instant, pornim video-ul
                setShowTransition(true);
            }
        } catch (err) {
            const standardizedError = getStandardErrorMessage(err);
            setError(standardizedError);
            setIsLoading(false); // Resetăm loading doar dacă avem eroare
        }
    };

    // <-- 4. Această funcție este apelată din interiorul video-ului când atinge momentul potrivit
    const handleTransitionPoint = () => {
        navigate('/main-menu');
    };

    return (
        <>
            {/* Afișăm tranziția DOAR dacă showTransition este true */}
            {showTransition && (
                <VideoTransition 
                    onTransitionPoint={handleTransitionPoint} 
                    // onComplete nu mai este necesar aici pentru că `Maps` distruge tot ecranul curent
                />
            )}

            <div className={`screen-container ${styles.authPage}`}>
                <div className={styles.authHeader}>
                    {/* Înlocuim <h1>INKoMOD</h1> cu componenta Logo */}
                    <Logo />
                    
                    {/* Textul original rămâne aici, neschimbat */}
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

                    {error && (
                        <div className='system-error-box'>
                            <span className='error-icon'>⚠️</span>
                            {error}
                        </div>
                    )}

                    <Button
                        type='submit'
                        disabled={isLoading || showTransition} // Dezactivăm butonul și pe durata animației
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
            </div>
        </>
    );
};

export default Login;