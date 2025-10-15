const Expense = require('../models/expense.model');
const Group = require('../models/group.model');
const User = require('../models/user.model');

const addExpense = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { description, amount, paidBy, participants } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const paidByUser = await User.findById(paidBy);
        if (!paidByUser) {
            return res.status(404).json({ error: 'Paid-by user not found' });
        }

        const participantUsers = await User.find({ _id: { $in: participants } });
        if (participantUsers.length !== participants.length) {
            return res.status(404).json({ error: 'One or more participant users not found' });
        }

        const newExpense = new Expense({
            description,
            amount,
            group: groupId,
            paidBy,
            participants,
        });

        await newExpense.save();
        
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addExpense,
};