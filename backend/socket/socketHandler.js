const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/user');
const logger = require('../config/logger');

// Store online users: { userId: socketId }
const onlineUsers = new Map();

// ====================================
// HELPERS
// ====================================

/** Validate that a value looks like a MongoDB ObjectId */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Strip HTML-significant chars from text content */
const sanitise = (str) =>
    typeof str === 'string' ? str.replace(/[<>]/g, '').trim() : '';

/**
 * Per-socket simple rate limiter.
 * Returns true if the event should be BLOCKED.
 */
const socketRateLimits = new WeakMap();
const RATE_WINDOW_MS = 1000; // 1 second window
const MAX_EVENTS_PER_WINDOW = 10;

const isRateLimited = (socket) => {
    const now = Date.now();
    let bucket = socketRateLimits.get(socket);
    if (!bucket || now - bucket.windowStart > RATE_WINDOW_MS) {
        bucket = { windowStart: now, count: 1 };
        socketRateLimits.set(socket, bucket);
        return false;
    }
    bucket.count++;
    return bucket.count > MAX_EVENTS_PER_WINDOW;
};

// ====================================
// SOCKET HANDLER
// ====================================
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        logger.info('Socket connected', { socketId: socket.id });

        // ===== USER GOES ONLINE =====
        socket.on('user_online', async (userId) => {
            if (!userId || !isValidId(userId)) return;

            onlineUsers.set(userId, socket.id);
            socket.userId = userId;
            logger.debug('User online', { userId });

            socket.broadcast.emit('user_status_change', {
                userId,
                status: 'online'
            });

            socket.join(`user_${userId}`);
        });

        // ===== JOIN A CONVERSATION ROOM =====
        socket.on('join_conversation', async ({ conversationId, userId }) => {
            try {
                if (!isValidId(conversationId) || !isValidId(userId)) {
                    socket.emit('error', { message: 'Invalid IDs' });
                    return;
                }

                const conversation = await Conversation.findById(conversationId).lean();
                if (!conversation) {
                    socket.emit('error', { message: 'Conversation not found' });
                    return;
                }

                const isParticipant = conversation.participants.some(
                    p => p.toString() === userId
                );

                if (!isParticipant) {
                    socket.emit('error', { message: 'Not authorized to join this conversation' });
                    return;
                }

                socket.join(`conversation_${conversationId}`);
                logger.debug('User joined conversation', { userId, conversationId });

                // Mark messages as read when joining (fire-and-forget for faster room join)
                Message.updateMany(
                    {
                        conversation: conversationId,
                        sender: { $ne: userId },
                        'readBy.user': { $ne: userId }
                    },
                    {
                        $push: { readBy: { user: userId, readAt: new Date() } }
                    }
                ).catch(err => logger.error('Error marking messages read on join', { error: err.message }));

                socket.to(`conversation_${conversationId}`).emit('user_joined', {
                    conversationId,
                    userId
                });

            } catch (error) {
                logger.error('Error joining conversation', { error: error.message });
                socket.emit('error', { message: 'Failed to join conversation' });
            }
        });

        // ===== LEAVE A CONVERSATION ROOM =====
        socket.on('leave_conversation', ({ conversationId, userId }) => {
            if (!conversationId) return;
            socket.leave(`conversation_${conversationId}`);
            logger.debug('User left conversation', { userId, conversationId });
        });

        // ===== SEND A MESSAGE =====
        socket.on('send_message', async (data) => {
            // Rate limit check
            if (isRateLimited(socket)) {
                socket.emit('error', { message: 'Too many messages, slow down' });
                return;
            }

            const {
                conversationId,
                senderId,
                content,
                messageType = 'text',
                fileUrl,
                fileName,
                fileSize,
                fileMimeType,
                thumbnailUrl,
                cloudinaryPublicId,
                mediaMetadata
            } = data;

            try {
                // Validate required IDs
                if (!isValidId(conversationId) || !isValidId(senderId)) {
                    socket.emit('error', { message: 'Invalid IDs' });
                    return;
                }

                // Sanitise text content
                const cleanContent = content ? sanitise(content) : '';

                // Validate that text messages have content
                if (messageType === 'text' && !cleanContent) {
                    socket.emit('error', { message: 'Message content is required' });
                    return;
                }

                // Verify sender is a participant (lean query for speed)
                const conversation = await Conversation.findById(conversationId).lean();
                if (!conversation) {
                    socket.emit('error', { message: 'Conversation not found' });
                    return;
                }
                const isParticipant = conversation.participants.some(
                    p => p.toString() === senderId
                );
                if (!isParticipant) {
                    socket.emit('error', { message: 'Not authorized' });
                    return;
                }

                // Create the message (_id generated immediately by Mongoose)
                const message = new Message({
                    conversation: conversationId,
                    sender: senderId,
                    content: cleanContent,
                    messageType,
                    fileUrl,
                    fileName: fileName ? sanitise(fileName) : undefined,
                    fileSize,
                    fileMimeType,
                    thumbnailUrl,
                    cloudinaryPublicId,
                    mediaMetadata,
                    readBy: [{ user: senderId, readAt: new Date() }]
                });

                // Save message first, then update conversation + populate in parallel
                await message.save();
                await Promise.all([
                    Conversation.findByIdAndUpdate(conversationId, {
                        latestMessage: message._id
                    }),
                    message.populate('sender', 'username email studentId')
                ]);

                // Emit to everyone in the conversation room
                const messagePayload = {
                    _id: message._id,
                    conversation: message.conversation,
                    sender: message.sender,
                    content: message.content,
                    messageType: message.messageType,
                    fileUrl: message.fileUrl,
                    fileName: message.fileName,
                    fileSize: message.fileSize,
                    fileMimeType: message.fileMimeType,
                    thumbnailUrl: message.thumbnailUrl,
                    mediaMetadata: message.mediaMetadata,
                    readBy: message.readBy,
                    createdAt: message.createdAt
                };

                io.to(`conversation_${conversationId}`).emit('receive_message', {
                    message: messagePayload
                });

                // Acknowledge to sender for optimistic UI updates
                socket.emit('message_sent', {
                    tempId: data.tempId,
                    message: messagePayload
                });

                // Notify participants not currently in the conversation room
                conversation.participants.forEach((participantId) => {
                    if (participantId.toString() !== senderId) {
                        const participantSocketId = onlineUsers.get(participantId.toString());
                        if (participantSocketId) {
                            io.to(`user_${participantId}`).emit('new_message_notification', {
                                conversationId,
                                message: {
                                    _id: message._id,
                                    sender: message.sender,
                                    content: message.content,
                                    messageType: message.messageType,
                                    fileName: message.fileName,
                                    createdAt: message.createdAt
                                }
                            });
                        }
                    }
                });

                logger.debug('Message sent', { conversationId, messageType });

            } catch (error) {
                logger.error('Error sending message', { error: error.message });
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // ===== TYPING INDICATOR =====
        socket.on('typing_start', ({ conversationId, userId, username }) => {
            if (!conversationId) return;
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                conversationId,
                userId,
                username: username ? sanitise(username) : '',
                isTyping: true
            });
        });

        socket.on('typing_stop', ({ conversationId, userId }) => {
            if (!conversationId) return;
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                conversationId,
                userId,
                isTyping: false
            });
        });

        // ===== MARK MESSAGES AS READ =====
        socket.on('mark_read', async ({ conversationId, userId }) => {
            try {
                if (!isValidId(conversationId) || !isValidId(userId)) return;

                await Message.updateMany(
                    {
                        conversation: conversationId,
                        sender: { $ne: userId },
                        'readBy.user': { $ne: userId }
                    },
                    {
                        $push: { readBy: { user: userId, readAt: new Date() } }
                    }
                );

                socket.to(`conversation_${conversationId}`).emit('messages_read', {
                    conversationId,
                    userId
                });

            } catch (error) {
                logger.error('Error marking messages as read', { error: error.message });
            }
        });

        // ===== CREATE/START DIRECT CONVERSATION =====
        socket.on('start_direct_chat', async ({ userId1, userId2 }) => {
            try {
                if (!isValidId(userId1) || !isValidId(userId2)) {
                    socket.emit('error', { message: 'Invalid user IDs' });
                    return;
                }

                const conversation = await Conversation.findOrCreateDirect(userId1, userId2);
                await conversation.populate('participants', 'username email studentId');

                io.to(`user_${userId1}`).emit('conversation_created', { conversation });
                io.to(`user_${userId2}`).emit('conversation_created', { conversation });

                logger.info('Direct chat created', { userId1, userId2 });

            } catch (error) {
                logger.error('Error creating direct chat', { error: error.message });
                socket.emit('error', { message: 'Failed to create conversation' });
            }
        });

        // ===== CREATE GROUP CONVERSATION =====
        socket.on('create_group', async ({ name, description, participants, adminId, category }) => {
            try {
                if (!name || !adminId || !isValidId(adminId)) {
                    socket.emit('error', { message: 'Group name and admin are required' });
                    return;
                }

                const conversation = new Conversation({
                    type: 'group',
                    name: sanitise(name),
                    description: description ? sanitise(description) : undefined,
                    participants,
                    admin: adminId,
                    category: category || null
                });

                await conversation.save();
                await conversation.populate('participants', 'username email studentId');

                participants.forEach((participantId) => {
                    io.to(`user_${participantId}`).emit('group_created', { conversation });
                });

                logger.info('Group created', { name: sanitise(name), adminId });

            } catch (error) {
                logger.error('Error creating group', { error: error.message });
                socket.emit('error', { message: 'Failed to create group' });
            }
        });

        // ===== ADD PARTICIPANT TO GROUP =====
        socket.on('add_to_group', async ({ conversationId, userId, addedBy }) => {
            try {
                if (!isValidId(conversationId) || !isValidId(userId) || !isValidId(addedBy)) {
                    socket.emit('error', { message: 'Invalid IDs' });
                    return;
                }

                const conversation = await Conversation.findById(conversationId);

                if (!conversation || conversation.type === 'direct') {
                    socket.emit('error', { message: 'Cannot add to this conversation' });
                    return;
                }

                await conversation.addParticipant(userId);

                const adder = await User.findById(addedBy);
                const added = await User.findById(userId);

                if (adder && added) {
                    const systemMessage = new Message({
                        conversation: conversationId,
                        sender: addedBy,
                        content: `${sanitise(adder.username)} added ${sanitise(added.username)} to the group`,
                        messageType: 'system',
                        systemMessageType: 'user_joined'
                    });
                    await systemMessage.save();
                }

                io.to(`conversation_${conversationId}`).emit('participant_added', {
                    conversationId,
                    userId,
                    addedBy
                });

                io.to(`user_${userId}`).emit('added_to_group', { conversation });

            } catch (error) {
                logger.error('Error adding to group', { error: error.message });
                socket.emit('error', { message: 'Failed to add participant' });
            }
        });

        // ===== REMOVE PARTICIPANT FROM GROUP =====
        socket.on('remove_from_group', async ({ conversationId, userId, removedBy }) => {
            try {
                if (!isValidId(conversationId) || !isValidId(userId) || !isValidId(removedBy)) {
                    socket.emit('error', { message: 'Invalid IDs' });
                    return;
                }

                const conversation = await Conversation.findById(conversationId);

                if (!conversation || conversation.type === 'direct') {
                    socket.emit('error', { message: 'Cannot remove from this conversation' });
                    return;
                }

                // Only admin can remove
                if (conversation.admin.toString() !== removedBy) {
                    socket.emit('error', { message: 'Only admin can remove participants' });
                    return;
                }

                await conversation.removeParticipant(userId);

                io.to(`conversation_${conversationId}`).emit('participant_removed', {
                    conversationId,
                    userId,
                    removedBy
                });

                io.to(`user_${userId}`).emit('removed_from_group', { conversationId });

            } catch (error) {
                logger.error('Error removing from group', { error: error.message });
                socket.emit('error', { message: 'Failed to remove participant' });
            }
        });

        // ===== USER DISCONNECTS =====
        socket.on('disconnect', () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);

                socket.broadcast.emit('user_status_change', {
                    userId: socket.userId,
                    status: 'offline'
                });

                logger.debug('User disconnected', { userId: socket.userId });
            } else {
                logger.debug('Socket disconnected', { socketId: socket.id });
            }
        });
    });

    // Helper function to get online users
    io.getOnlineUsers = () => onlineUsers;

    return io;
};

module.exports = socketHandler;
