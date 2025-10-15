import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import AddExpenseForm from '../components/AddExpenseForm';
import BalancesSummary from '../components/BalancesSummary';
import SettleUpModal from '../components/SettleUpModal';
import InviteMemberForm from '../components/InviteMemberForm';
import Header from '../components/Header';

const API_URL = import.meta.env.VITE_API_URL;

const GroupDetail = () => {
    const { id } = useParams();
    const { getToken } = useAuth();
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState([]);
    const [settleTransactions, setSettleTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSettleModalOpen, setSettleModalOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const [groupRes, summaryRes] = await Promise.all([
                axios.get(`${API_URL}/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/groups/${id}/summary`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setGroup(groupRes.data.group);
            setExpenses(groupRes.data.expenses);
            setSummary(summaryRes.data);
            setNewGroupName(groupRes.data.group.name); // Initialize for editing
        } catch (err) {
            console.error("Error fetching group details:", err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("An unknown error occurred while fetching group details.");
            }
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSettleUp = async () => {
        try {
            const token = await getToken();
            const res = await axios.get(`${API_URL}/groups/${id}/settle`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSettleTransactions(res.data);
            setSettleModalOpen(true);
        } catch (err) {
            console.error("Error calculating settlement:", err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to calculate settlement: ${err.response.data.error}`);
            } else {
                setError("An unknown error occurred while calculating settlement.");
            }
        }
    };

    const handleUpdateGroupName = async () => {
        if (!newGroupName.trim()) return;
        try {
            const token = await getToken();
            await axios.put(`${API_URL}/groups/${id}`, { name: newGroupName }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsEditingName(false);
            fetchData(); // Refresh group data
        } catch (err) {
            console.error("Error updating group name:", err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to update group name: ${err.response.data.error}`);
            } else {
                setError("An unknown error occurred while updating group name.");
            }
        }
    };

    const handleRemoveMember = async (memberId) => {
        console.log('handleRemoveMember called for memberId:', memberId);
        try {
            console.log('Attempting to get token for member removal...');
            const token = await getToken();
            console.log('Token obtained. Attempting axios.delete for memberId:', memberId);
            await axios.delete(`${API_URL}/groups/${id}/members/${memberId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('axios.delete successful. Refreshing data...');
            fetchData(); // Refresh group data
        } catch (err) {
            console.error("Error removing member:", err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to remove member: ${err.response.data.error}`);
            } else {
                setError("An unknown error occurred while removing member.");
            }
        }
    };

    if (loading) return <p className="text-center">Loading group details...</p>;
    if (error) return <div className="text-center text-red"><h3>Error</h3><p>{error}</p></div>;
    if (!group) return <p className="text-center">Group not found.</p>;

    return (
        <>
            <Header />
            <main className="container">
                <div className="group-header-section">
                    {isEditingName ? (
                        <div className="edit-group-name-form">
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                            <button onClick={handleUpdateGroupName} className="small-button">Save</button>
                            <button onClick={() => setIsEditingName(false)} className="small-button secondary-button">Cancel</button>
                        </div>
                    ) : (
                        <h1 className="group-name-display">
                            {group.name}
                            <button onClick={() => setIsEditingName(true)} className="edit-icon-button">
                                ✏️
                            </button>
                        </h1>
                    )}
                    <p className="group-creator-info">Created by {group.createdBy?.name}</p>
                </div>

                <div className="grid-2-cols">
                    <div>
                        <AddExpenseForm groupId={id} members={group.members} onExpenseAdded={fetchData} />
                        <InviteMemberForm groupId={id} onMemberAdded={fetchData} />
                    </div>

                    <div>
                        <BalancesSummary summary={summary} />
                        <div className="text-center">
                            <button onClick={handleSettleUp}>
                                Settle Up
                            </button>
                        </div>
                    </div>
                </div>

                <div className="section-margin">
                    <h2>Group Members</h2>
                    <ul>
                        {group.members.map(member => (
                            <li key={member._id} className="member-list-item">
                                <div className="member-info">
                                    <span>{member.name} ({member.email})</span>
                                    {group.createdBy._id !== member._id && (
                                        <button onClick={() => handleRemoveMember(member._id)} className="remove-member-icon">
                                            &times;
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="section-margin">
                    <h2>Expenses</h2>
                    <ul>
                        {expenses.map((expense) => (
                            <li key={expense._id} className="expense-list-item">
                                <div className="expense-details">
                                    <p><strong>{expense.description}</strong></p>
                                    <p>Paid by {expense.paidBy.name}</p>
                                </div>
                                <div className="expense-amount-date">
                                    <p className="expense-amount">${expense.amount.toFixed(2)}</p>
                                    <p className="expense-date">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <SettleUpModal
                    isOpen={isSettleModalOpen}
                    onClose={() => setSettleModalOpen(false)}
                    transactions={settleTransactions}
                />
            </main>
        </>
    );
};

export default GroupDetail;