import React, { useState } from 'react';
import './AuthPage.css';
import { auth } from '../../firebase'; 
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile
} from "firebase/auth";

// --- SVG Icons ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const BackArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const GoogleIcon = () => <svg height="20" width="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path><path d="M1 1h22v22H1z" fill="none"></path></svg>;

export default function AuthPage({ initialView, theme, toggleTheme, navigateToLanding }) {
    const [view, setView] = useState(initialView || 'login');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // The onAuthStateChanged listener in App.jsx will handle navigation.
        } catch (err) {
            setError(err.message);
        }
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const email = e.target.email.value.toLowerCase();
        const password = view !== 'forgotPassword' ? e.target.password.value : null;

        if (view !== 'forgotPassword' && password && !validatePassword(password)) {
            setError("Password must be 8-16 characters and include an uppercase letter, a number, and a special character (!@#$%^&*).");
            return;
        }

        if (view === 'signup') {
            const name = e.target.name.value;
            const confirmPassword = e.target.confirmPassword.value;
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                alert('Sign up successful! Please log in to continue.');
                setView('login');
            } catch (err) {
                setError(err.message);
            }
        } else if (view === 'login') {
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (err) {
                setError("Failed to log in. Please check your email and password.");
            }
        } else if (view === 'forgotPassword') {
            try {
                await sendPasswordResetEmail(auth, email);
                alert('Password reset link sent to your email!');
                setView('login');
            } catch (err) {
                setError("Failed to send reset email. Please check the address.");
            }
        }
    };

    const getTitle = () => {
        if (view === 'login') return 'Welcome Back!';
        if (view === 'signup') return 'Create Your Account';
        return 'Reset Your Password';
    };

    const getButtonText = () => {
        if (view === 'login') return 'Login';
        if (view === 'signup') return 'Create Account';
        return 'Send Reset Link';
    };

    return (
        <div className="auth-page-container">
             <button className="theme-toggle-auth" onClick={toggleTheme}>
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className="auth-card">
                <button className="auth-back-button" onClick={navigateToLanding}>
                    <BackArrowIcon />
                </button>

                <div className="auth-header">
                    <h1>DevPulse</h1>
                    <h2>{getTitle()}</h2>
                    {view === 'forgotPassword' && <p className="reset-instructions">Enter your email to receive a password reset link.</p>}
                </div>

                {view !== 'forgotPassword' && (
                    <>
                        <button type="button" className="google-signin-button" onClick={handleGoogleSignIn}>
                            <GoogleIcon />
                            Continue with Google
                        </button>
                        <div className="auth-divider">
                            <span>OR</span>
                        </div>
                    </>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {view === 'signup' && (
                        <div className="input-group">
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" name="name" placeholder="Alex Doe" required />
                        </div>
                    )}
                    
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="alex.doe@example.com" required />
                    </div>

                    {view !== 'forgotPassword' && (
                        <>
                            <div className="input-group password-group">
                                <div className="password-label-container">
                                    <label htmlFor="password">Password</label>
                                    {view === 'login' && (
                                        <button type="button" className="forgot-password-button" onClick={() => setView('forgotPassword')}>
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>

                            {view === 'signup' && (
                                <div className="input-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-submit-button">
                        {getButtonText()}
                    </button>
                </form>

                <div className="auth-footer">
                    {view === 'login' && (
                        <p>Don't have an account? <button onClick={() => setView('signup')}>Sign Up</button></p>
                    )}
                    {view === 'signup' && (
                        <p>Already have an account? <button onClick={() => setView('login')}>Login</button></p>
                    )}
                     {view === 'forgotPassword' && (
                        <p>Remember your password? <button onClick={() => setView('login')}>Back to Login</button></p>
                    )}
                </div>
            </div>
        </div>
    );
}

