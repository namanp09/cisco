import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AddExpenseForm = ({ groupId, members, onExpenseAdded }) => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && members.length > 0) {
            const currentUser = members.find(m => m.email === user.primaryEmailAddress.emailAddress);
            if (currentUser) {
                setPaidBy(currentUser._id);
            }
        }
    }, [user, members]);

    const handleParticipantChange = (memberId) => {
        setParticipants(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !amount || !paidBy || participants.length === 0) {
            setError('All fields are required, and at least one participant must be selected.');
            return;
        }
        setError('');

        try {
            const token = await getToken();
            await axios.post(
                `${API_URL}/groups/${groupId}/expenses`,
                {
                    description,
                    amount: parseFloat(amount),
                    paidBy: paidBy,
                    participants: participants,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onExpenseAdded();
            setDescription('');
            setAmount('');
            setParticipants([]);
        } catch (err) {
            console.error("Error adding expense:", err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to add expense: ${err.response.data.error}`);
            } else {
                setError("An unknown error occurred while adding the expense.");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Add New Expense</h3>
            {error && <p className="text-red">{error}</p>}
            <div>
                <label htmlFor="description">Description</label>
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="amount">Amount</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="paidBy">Paid By</label>
                <select
                    id="paidBy"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                >
                    {members.map(member => (
                        <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Participants</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {members.map(member => (
                        <div key={member._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label htmlFor={`participant-${member._id}`} style={{ marginBottom: 0, flexGrow: 1 }}>
                                {member.name}
                            </label>
                            <input
                                type="checkbox"
                                id={`participant-${member._id}`}
                                checked={participants.includes(member._id)}
                                onChange={() => handleParticipantChange(member._id)}
                                style={{ margin: 0 }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <button type="submit">
                Add Expense
            </button>
        </form>
    );
};

export default AddExpenseForm;