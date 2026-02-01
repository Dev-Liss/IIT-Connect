/**
 * ====================================
 * CONVERSATION ROUTES
 * ====================================
 * REST API endpoints for managing conversations
 */

const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const conversations = await Conversation.getUserConversations(req.user._id);
        res.json({
            success: true,
            count: conversations.length,
            conversations
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations'
        });
    }
});

/**
 * @route   GET /api/conversations/:id
 * @desc    Get single conversation by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate('participants', 'username email studentId')
            .populate('admin', 'username email')
            .populate({
                path: 'latestMessage',
                populate: { path: 'sender', select: 'username' }
            });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(
            p => p._id.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this conversation'
            });
        }

        res.json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversation'
        });
    }
});

/**
 * @route   POST /api/conversations/direct
 * @desc    Create or get existing direct conversation
 * @access  Private
 */
router.post('/direct', protect, async (req, res) => {
    try {
        const { participantId } = req.body;

        if (!participantId) {
            return res.status(400).json({
                success: false,
                message: 'Participant ID is required'
            });
        }

        if (participantId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create conversation with yourself'
            });
        }

        const conversation = await Conversation.findOrCreateDirect(
            req.user._id,
            participantId
        );

        await conversation.populate('participants', 'username email studentId');

        res.status(201).json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error('Error creating direct conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create conversation'
        });
    }
});

/**
 * @route   POST /api/conversations/group
 * @desc    Create a new group conversation
 * @access  Private
 */
router.post('/group', protect, async (req, res) => {
    try {
        const { name, description, participants, category } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Group name is required'
            });
        }

        // Ensure creator is included in participants
        const allParticipants = [...new Set([
            req.user._id.toString(),
            ...(participants || [])
        ])];

        // Allow creating groups with just the creator (can add members later)
        if (allParticipants.length < 1) {
            return res.status(400).json({
                success: false,
                message: 'Group must have at least 1 participant'
            });
        }

        const conversation = new Conversation({
            type: 'group',
            name,
            description,
            participants: allParticipants,
            admin: req.user._id,
            category: category || 'general'
        });

        await conversation.save();
        await conversation.populate('participants', 'username email studentId');

        res.status(201).json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create group'
        });
    }
});

/**
 * @route   PUT /api/conversations/:id
 * @desc    Update group conversation (name, description)
 * @access  Private (Admin only)
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, description, category } = req.body;
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (conversation.type === 'direct') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update direct conversations'
            });
        }

        // Only admin can update
        if (conversation.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can update the group'
            });
        }

        if (name) conversation.name = name;
        if (description !== undefined) conversation.description = description;
        if (category) conversation.category = category;

        await conversation.save();
        await conversation.populate('participants', 'username email studentId');

        res.json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error('Error updating conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update conversation'
        });
    }
});

/**
 * @route   POST /api/conversations/:id/participants
 * @desc    Add participant to group
 * @access  Private (Admin/Moderator)
 */
router.post('/:id/participants', protect, async (req, res) => {
    try {
        const { userId } = req.body;
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (conversation.type === 'direct') {
            return res.status(400).json({
                success: false,
                message: 'Cannot add participants to direct conversations'
            });
        }

        // Check if requester is admin or moderator
        const isAdmin = conversation.admin.toString() === req.user._id.toString();
        const isModerator = conversation.moderators.some(
            m => m.toString() === req.user._id.toString()
        );

        if (!isAdmin && !isModerator) {
            return res.status(403).json({
                success: false,
                message: 'Only admin or moderators can add participants'
            });
        }

        await conversation.addParticipant(userId);
        await conversation.populate('participants', 'username email studentId');

        res.json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error('Error adding participant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add participant'
        });
    }
});

/**
 * @route   DELETE /api/conversations/:id/participants/:userId
 * @desc    Remove participant from group
 * @access  Private (Admin only)
 */
router.delete('/:id/participants/:userId', protect, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (conversation.type === 'direct') {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove participants from direct conversations'
            });
        }

        // Only admin can remove (or user removing themselves)
        const isAdmin = conversation.admin.toString() === req.user._id.toString();
        const isSelf = req.params.userId === req.user._id.toString();

        if (!isAdmin && !isSelf) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can remove participants'
            });
        }

        await conversation.removeParticipant(req.params.userId);
        await conversation.populate('participants', 'username email studentId');

        res.json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error('Error removing participant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove participant'
        });
    }
});

/**
 * @route   DELETE /api/conversations/:id
 * @desc    Delete conversation (Admin only for groups)
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // For groups, only admin can delete
        if (conversation.type !== 'direct') {
            if (conversation.admin.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Only admin can delete the group'
                });
            }
        }

        // Delete all messages in the conversation
        await Message.deleteMany({ conversation: conversation._id });

        // Delete the conversation
        await conversation.deleteOne();

        res.json({
            success: true,
            message: 'Conversation deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete conversation'
        });
    }
});

module.exports = router;
