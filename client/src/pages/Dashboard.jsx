import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const { getToken } = useAuth();
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const res = await axios.get(`${API_URL}/groups`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGroups(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching groups:", err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("An unknown error occurred while fetching groups.");
            }
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) return;
        try {
            const token = await getToken();
            await axios.post(`${API_URL}/groups`, { name: groupName }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGroupName('');
            fetchGroups();
        } catch (err) {
            console.error("Error creating group:", err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to create group: ${err.response.data.error}`);
            } else {
                setError("An unknown error occurred while creating the group.");
            }
        }
    };

    const renderContent = () => {
        if (loading) {
            return <p className="text-center">Loading groups...</p>;
        }

        if (error) {
            return (
                <div className="text-center text-red" style={{ padding: '20px', border: '1px solid #e74c3c', borderRadius: '5px' }}>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <p>
                        <strong>Note:</strong> If the error is "User not found", it may mean your user account has not been synced to the database yet. This can sometimes happen on the first sign-in. Please try signing out and signing back in.
                    </p>
                </div>
            );
        }

        if (groups.length === 0) {
            return <p className="text-center">You are not a member of any groups yet. Create one to get started!</p>;
        }

        return (
            <ul>
                {groups.map((group) => (
                    <li key={group._id}>
                        <Link to={`/group/${group._id}`} className="group-list-item-link">
                            <div className="list-item-content">
                                <strong>{group.name}</strong>
                                <span>{group.members.length} member(s)</span>
                            </div>
                            <span className="chevron-icon">&gt;</span>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <>
            <Header />
            <main className="container">
                <h1>My Groups</h1>
                
                <form onSubmit={handleCreateGroup}>
                    <h2>Create a New Group</h2>
                    <div className="form-field-with-button">
                        <label htmlFor="groupName">Group Name</label>
                        <input
                            type="text"
                            id="groupName"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name"
                        />
                        <button type="submit">Create Group</button>
                    </div>
                </form>

                <div>
                    <h2>Existing Groups</h2>
                    {renderContent()}
                </div>
            </main>
        </>
    );
};

export default Dashboard;