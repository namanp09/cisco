const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');

// POST /api/groups - Create a new group
router.post('/', groupController.createGroup);

// GET /api/groups - Get all groups for the current user
router.get('/', groupController.getGroups);

// GET /api/groups/:id - Get details of a single group
router.get('/:id', groupController.getGroupDetails);

// PUT /api/groups/:id - Update a group (e.g., rename)
router.put('/:id', groupController.updateGroup);

// POST /api/groups/:id/members - Add a new member to a group
router.post('/:id/members', groupController.addMember);

// DELETE /api/groups/:id/members/:memberId - Remove a member from a group
router.delete('/:id/members/:memberId', groupController.removeMember);

// GET /api/groups/:groupId/summary - Get expense summary for a group
router.get('/:groupId/summary', groupController.getGroupSummary);

// GET /api/groups/:groupId/settle - Get settlement plan for a group
router.get('/:groupId/settle', groupController.settleUp);

module.exports = router;