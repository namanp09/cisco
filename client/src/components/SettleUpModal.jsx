import React from 'react';

const SettleUpModal = ({ isOpen, onClose, transactions }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Settlement Plan</h2>
                {transactions.length > 0 ? (
                    <ul>
                        {transactions.map((txn, index) => (
                            <li key={index}>
                                <span className="text-red">{txn.from}</span> should pay <span className="text-green">{txn.to}</span>
                                <strong> ${txn.amount}</strong>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>All debts are settled!</p>
                )}
                <div>
                    <button onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettleUpModal;