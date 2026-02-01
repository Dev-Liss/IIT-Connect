/**
 * ====================================
 * MESSAGE ROUTES
 * ====================================
 * REST API endpoints for managing messages
 */

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get messages for a conversation with pagination
 * @access  Private
 */
router.get('/:conversationId', protect, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50, before } = req.query;

        // Verify user is a participant
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const isParticipant = conversation.participants.some(
            p => p.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these messages'
            });
        }

        // Build query
        let query = { conversation: conversationId };

        // If "before" timestamp provided, get messages before that time (for infinite scroll)
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('sender', 'username email studentId')
            .lean();

        // Reverse to get chronological order
        messages.reverse();

        // Get total count for pagination
        const total = await Message.countDocuments({ conversation: conversationId });

        res.json({
            success: true,
            messages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
});

/**
 * @route   POST /api/messages/:conversationId
 * @desc    Send a message (REST fallback, prefer Socket.io)
 * @access  Private
 */
router.post('/:conversationId', protect, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content, messageType = 'text', fileUrl, fileName } = req.body;

        if (!content && messageType === 'text') {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        // Verify user is a participant
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const isParticipant = conversation.participants.some(
            p => p.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages in this conversation'
            });
        }

        // Create message
        const message = new Message({
            conversation: conversationId,
            sender: req.user._id,
            content,
            messageType,
            fileUrl,
            fileName,
            readBy: [{ user: req.user._id, readAt: new Date() }]
        });

        await message.save();

        // Update conversation's latestMessage
        await Conversation.findByIdAndUpdate(conversationId, {
            latestMessage: message._id
        });

        // Populate sender info
        await message.populate('sender', 'username email studentId');

        res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});

/**
 * @route   PUT /api/messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/:messageId/read', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if already read
        const alreadyRead = message.readBy.some(
            r => r.user.toString() === req.user._id.toString()
        );

        if (!alreadyRead) {
            message.readBy.push({
                user: req.user._id,
                readAt: new Date()
            });
            await message.save();
        }

        res.json({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as read'
        });
    }
});

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message (soft delete - marks as deleted)
 * @access  Private (only sender can delete)
 */
router.delete('/:messageId', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can delete their message
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message'
            });
        }

        // Soft delete - replace content
        message.content = 'This message was deleted';
        message.messageType = 'system';
        message.systemMessageType = 'deleted';
        message.fileUrl = undefined;
        message.fileName = undefined;

        await message.save();

        res.json({
            success: true,
            message: 'Message deleted'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message'
        });
    }
});

/**
 * @route   GET /api/messages/:conversationId/search
 * @desc    Search messages in a conversation
 * @access  Private
 */
router.get('/:conversationId/search', protect, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { q, limit = 20 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // Verify user is a participant
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const isParticipant = conversation.participants.some(
            p => p.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to search in this conversation'
            });
        }

        const messages = await Message.find({
            conversation: conversationId,
            content: { $regex: q, $options: 'i' },
            messageType: 'text'
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('sender', 'username email studentId');

        res.json({
            success: true,
            messages,
            query: q
        });
    } catch (error) {
        console.error('Error searching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search messages'
        });
    }
});

module.exports = router;
