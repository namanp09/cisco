const Group = require('../models/group.model');
const User = require('../models/user.model');
const Expense = require('../models/expense.model');

const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findOne({ clerkId: req.auth.userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newGroup = new Group({
            name,
            createdBy: user._id,
            members: [user._id],
        });

        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGroups = async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.auth.userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const groups = await Group.find({ members: user._id }).populate('members', 'name email');
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGroupDetails = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name email')
            .populate('createdBy', 'name email')
            
        const expenses = await Expense.find({group: req.params.id})
            .populate('paidBy', 'name email')
            .populate('participants', 'name email');

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.status(200).json({group, expenses});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const group = await Group.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true, runValidators: true }
        );

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addMember = async (req, res) => {
    try {
        const { email } = req.body;
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User with that email not found' });
        }

        if (group.members.includes(user._id)) {
            return res.status(400).json({ error: 'User is already in the group' });
        }

        group.members.push(user._id);
        await group.save();
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeMember = async (req, res) => {
    console.log('removeMember: Function called.');
    try {
        const { id, memberId } = req.params;
        console.log(`removeMember: Attempting to find group ${id} and remove member ${memberId}.`);
        const group = await Group.findById(id).populate('members'); // Populate members for balance calculation

        if (!group) {
            console.log('removeMember: Group not found.');
            return res.status(404).json({ error: 'Group not found' });
        }
        console.log('removeMember: Group found.', group.name);

        // Check if the member is the creator
        if (group.createdBy.toString() === memberId) {
            console.log('removeMember: Attempted to remove group creator.');
            return res.status(400).json({ error: 'Cannot remove group creator' });
        }
        console.log('removeMember: Member is not the creator.');

        // Calculate balances to check for outstanding amounts
        const expenses = await Expense.find({ group: id });
        const memberBalances = {};
        group.members.forEach(member => {
            memberBalances[member._id] = { balance: 0, name: member.name, id: member._id };
        });

        expenses.forEach(expense => {
            const share = expense.amount / expense.participants.length;
            
            if(memberBalances[expense.paidBy]) {
                memberBalances[expense.paidBy].balance += expense.amount;
            }

            expense.participants.forEach(participantId => {
                 if(memberBalances[participantId]) {
                    memberBalances[participantId].balance -= share;
                }
            });
        });

        const memberToRemoveBalance = memberBalances[memberId] ? memberBalances[memberId].balance : 0;
        console.log(`removeMember: Member ${memberId} balance: ${memberToRemoveBalance}`);

        // Allow a small epsilon for floating point comparisons
        if (Math.abs(memberToRemoveBalance) > 0.01) {
            console.log('removeMember: Member has outstanding balance.');
            return res.status(400).json({ error: 'Cannot remove member with outstanding balance. Please settle up first.' });
        }
        console.log('removeMember: Member has no outstanding balance.');

        console.log('removeMember: Filtering members array. Before:', group.members.length);
        group.members = group.members.filter(
            (member) => member._id.toString() !== memberId
        );
        console.log('removeMember: Filtering members array. After:', group.members.length);
        await group.save();
        console.log('removeMember: Group saved successfully.');
        res.status(200).json(group);
    } catch (error) {
        console.error('removeMember: Error in catch block:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const getGroupSummary = async (req, res) => {
    try {
        const { groupId } = req.params;
        const expenses = await Expense.find({ group: groupId });
        const group = await Group.findById(groupId).populate('members');

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const memberBalances = {};
        group.members.forEach(member => {
            memberBalances[member._id] = { balance: 0, name: member.name, id: member._id };
        });

        expenses.forEach(expense => {
            const share = expense.amount / expense.participants.length;
            
            if(memberBalances[expense.paidBy]) {
                memberBalances[expense.paidBy].balance += expense.amount;
            }

            expense.participants.forEach(participantId => {
                 if(memberBalances[participantId]) {
                    memberBalances[participantId].balance -= share;
                }
            });
        });

        res.status(200).json(Object.values(memberBalances));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const settleUp = async (req, res) => {
    try {
        const { groupId } = req.params;
        const expenses = await Expense.find({ group: groupId });
        const group = await Group.findById(groupId).populate('members');

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const memberBalances = {};
        group.members.forEach(member => {
            memberBalances[member._id] = { id: member._id, name: member.name, balance: 0 };
        });

        expenses.forEach(expense => {
            const share = expense.amount / expense.participants.length;
            if(memberBalances[expense.paidBy]) memberBalances[expense.paidBy].balance += expense.amount;
            expense.participants.forEach(participantId => {
                if(memberBalances[participantId]) memberBalances[participantId].balance -= share;
            });
        });

        const balances = Object.values(memberBalances);
        const debtors = balances.filter(m => m.balance < 0);
        const creditors = balances.filter(m => m.balance > 0);
        const transactions = [];

        while (debtors.length > 0 && creditors.length > 0) {
            const debtor = debtors[0];
            const creditor = creditors[0];
            const amount = Math.min(-debtor.balance, creditor.balance);

            transactions.push({
                from: debtor.name,
                to: creditor.name,
                amount: amount.toFixed(2),
            });

            debtor.balance += amount;
            creditor.balance -= amount;

            if (Math.abs(debtor.balance) < 0.01) debtors.shift();
            if (Math.abs(creditor.balance) < 0.01) creditors.shift();
        }

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    createGroup,
    getGroups,
    getGroupDetails,
    updateGroup,
    addMember,
    removeMember,
    getGroupSummary,
    settleUp,
};