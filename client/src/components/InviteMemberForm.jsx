import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const InviteMemberForm = ({ groupId, onMemberAdded }) => {
    const { getToken } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required.');
            return;
        }
        setError('');
        setSuccess('');

        try {
            const token = await getToken();
            await axios.post(
                `${API_URL}/groups/${groupId}/members`,
                { email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onMemberAdded();
            setEmail('');
            setSuccess('Member added successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add member.');
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Invite a Member</h3>
            {error && <p className="text-red">{error}</p>}
            {success && <p className="text-green">{success}</p>}
            <div>
                <label htmlFor="memberEmail">Member Email</label>
                <input
                    type="email"
                    id="memberEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter member's email"
                />
            </div>
            <button type="submit">
                Invite
            </button>
        </form>
    );
};

export default InviteMemberForm;