import React from 'react';

const BalancesSummary = ({ summary }) => {
    const creditors = summary.filter(item => item.balance > 0);
    const debtors = summary.filter(item => item.balance < 0);

    return (
        <div className="form"> {/* Using 'form' class for general container styling */}
            <h3>Balances</h3>
            <div>
                <div>
                    <h4 className="text-green">Who is owed money:</h4>
                    {creditors.length > 0 ? (
                        <ul>
                            {creditors.map(item => (
                                <li key={item.id}>
                                    {item.name} is owed ${item.balance.toFixed(2)}
                                </li>
                            ))}
                        </ul>
                    ) : <p>No one is owed money.</p>}
                </div>
                <div>
                    <h4 className="text-red">Who owes money:</h4>
                    {debtors.length > 0 ? (
                        <ul>
                            {debtors.map(item => (
                                <li key={item.id}>
                                    {item.name} owes ${Math.abs(item.balance).toFixed(2)}
                                </li>
                            ))}
                        </ul>
                    ) : <p>No one owes money.</p>}
                </div>
            </div>
        </div>
    );
};

export default BalancesSummary;