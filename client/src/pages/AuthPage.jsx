import React from 'react';
import { SignIn, SignUp, SignedOut } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const navigate = useNavigate();

    return (
        <div className="full-screen-center">
            <h1>Expense Splitter</h1>
            <p style={{ maxWidth: '400px', textAlign: 'center', marginBottom: '30px' }}>
                Effortlessly manage and split expenses with friends and family. Track who paid what, who owes whom, and settle up with ease.
            </p>
            <button onClick={() => navigate('/sign-in')}>Sign In</button>
            <p style={{ marginTop: '20px' }}>Don't have an account? <button onClick={() => navigate('/sign-up')} style={{ backgroundColor: 'transparent', boxShadow: 'none', color: 'var(--primary-accent-color)', padding: '0', margin: '0' }}>Sign Up</button></p>
            <footer style={{ position: 'absolute', bottom: '20px', color: 'var(--secondary-text-color)', fontSize: '0.9rem' }}>
                Created by Naman Padiyar
            </footer>
        </div>
    );
};

export default AuthPage;