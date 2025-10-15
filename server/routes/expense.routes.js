const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');

// POST /api/groups/:groupId/expenses - Add a new expense to a group
router.post('/:groupId/expenses', expenseController.addExpense);

module.exports = router;