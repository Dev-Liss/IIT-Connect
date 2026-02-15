const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/user');

// Store online users: { odId: socketId }
const onlineUsers = new Map();

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        // ===== USER GOES ONLINE =====
        socket.on('user_online', async (userId) => {
            if (!userId) return;

            onlineUsers.set(userId, socket.id);
            socket.userId = userId;
            console.log(`👤 User ${userId} is now online`);

            // Notify friends/contacts that user is online
            socket.broadcast.emit('user_status_change', {
                userId,
                status: 'online'
            });

            // Join user's personal room for direct messages
            socket.join(`user_${userId}`);
        });

        // ===== JOIN A CONVERSATION ROOM =====
        socket.on('join_conversation', async ({ conversationId, userId }) => {
            try {
                // Verify user is a participant
                const conversation = await Conversation.findById(conversationId);
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
                console.log(`👥 User ${userId} joined conversation ${conversationId}`);

                // Mark messages as read when joining
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

                // Notify others that user joined
                socket.to(`conversation_${conversationId}`).emit('user_joined', {
                    conversationId,
                    userId
                });

            } catch (error) {
                console.error('Error joining conversation:', error);
                socket.emit('error', { message: 'Failed to join conversation' });
            }
        });

        // ===== LEAVE A CONVERSATION ROOM =====
        socket.on('leave_conversation', ({ conversationId, userId }) => {
            socket.leave(`conversation_${conversationId}`);
            console.log(`👋 User ${userId} left conversation ${conversationId}`);
        });

        // ===== SEND A MESSAGE =====
        socket.on('send_message', async (data) => {
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
                // Create and save the message
                const message = new Message({
                    conversation: conversationId,
                    sender: senderId,
                    content,
                    messageType,
                    fileUrl,
                    fileName,
                    fileSize,
                    fileMimeType,
                    thumbnailUrl,
                    cloudinaryPublicId,
                    mediaMetadata,
                    readBy: [{ user: senderId, readAt: new Date() }]
                });

                await message.save();

                // Populate sender info for the response
                await message.populate('sender', 'username email studentId');

                // Update conversation's latestMessage
                await Conversation.findByIdAndUpdate(conversationId, {
                    latestMessage: message._id
                });

                // Get conversation to find all participants
                const conversation = await Conversation.findById(conversationId);

                // Emit to everyone in the conversation room
                io.to(`conversation_${conversationId}`).emit('receive_message', {
                    message: {
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
                    }
                });

                // Also notify participants who might not be in the conversation room
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

                console.log(`📨 Message sent in conversation ${conversationId} (type: ${messageType})`);

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // ===== TYPING INDICATOR =====
        socket.on('typing_start', ({ conversationId, userId, username }) => {
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                conversationId,
                userId,
                username,
                isTyping: true
            });
        });

        socket.on('typing_stop', ({ conversationId, userId }) => {
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                conversationId,
                userId,
                isTyping: false
            });
        });

        // ===== MARK MESSAGES AS READ =====
        socket.on('mark_read', async ({ conversationId, userId }) => {
            try {
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

                // Notify others that messages were read
                socket.to(`conversation_${conversationId}`).emit('messages_read', {
                    conversationId,
                    userId
                });

            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        });

        // ===== CREATE/START DIRECT CONVERSATION =====
        socket.on('start_direct_chat', async ({ userId1, userId2 }) => {
            try {
                const conversation = await Conversation.findOrCreateDirect(userId1, userId2);

                await conversation.populate('participants', 'username email studentId');

                // Notify both users about the conversation
                io.to(`user_${userId1}`).emit('conversation_created', { conversation });
                io.to(`user_${userId2}`).emit('conversation_created', { conversation });

                console.log(`💬 Direct chat created between ${userId1} and ${userId2}`);

            } catch (error) {
                console.error('Error creating direct chat:', error);
                socket.emit('error', { message: 'Failed to create conversation' });
            }
        });

        // ===== CREATE GROUP CONVERSATION =====
        socket.on('create_group', async ({ name, description, participants, adminId, category }) => {
            try {
                const conversation = new Conversation({
                    type: 'group',
                    name,
                    description,
                    participants,
                    admin: adminId,
                    category: category || 'general'
                });

                await conversation.save();
                await conversation.populate('participants', 'username email studentId');

                // Notify all participants
                participants.forEach((participantId) => {
                    io.to(`user_${participantId}`).emit('group_created', { conversation });
                });

                console.log(`👥 Group "${name}" created by ${adminId}`);

            } catch (error) {
                console.error('Error creating group:', error);
                socket.emit('error', { message: 'Failed to create group' });
            }
        });

        // ===== ADD PARTICIPANT TO GROUP =====
        socket.on('add_to_group', async ({ conversationId, userId, addedBy }) => {
            try {
                const conversation = await Conversation.findById(conversationId);

                if (!conversation || conversation.type === 'direct') {
                    socket.emit('error', { message: 'Cannot add to this conversation' });
                    return;
                }

                await conversation.addParticipant(userId);

                // Create system message
                const adder = await User.findById(addedBy);
                const added = await User.findById(userId);

                const systemMessage = new Message({
                    conversation: conversationId,
                    sender: addedBy,
                    content: `${adder.username} added ${added.username} to the group`,
                    messageType: 'system',
                    systemMessageType: 'member_added'
                });
                await systemMessage.save();

                // Notify the group
                io.to(`conversation_${conversationId}`).emit('participant_added', {
                    conversationId,
                    userId,
                    addedBy
                });

                // Notify the added user
                io.to(`user_${userId}`).emit('added_to_group', { conversation });

            } catch (error) {
                console.error('Error adding to group:', error);
                socket.emit('error', { message: 'Failed to add participant' });
            }
        });

        // ===== REMOVE PARTICIPANT FROM GROUP =====
        socket.on('remove_from_group', async ({ conversationId, userId, removedBy }) => {
            try {
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

                // Notify the group
                io.to(`conversation_${conversationId}`).emit('participant_removed', {
                    conversationId,
                    userId,
                    removedBy
                });

                // Notify the removed user
                io.to(`user_${userId}`).emit('removed_from_group', { conversationId });

            } catch (error) {
                console.error('Error removing from group:', error);
                socket.emit('error', { message: 'Failed to remove participant' });
            }
        });

        // ===== USER DISCONNECTS =====
        socket.on('disconnect', () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);

                // Notify others that user went offline
                socket.broadcast.emit('user_status_change', {
                    userId: socket.userId,
                    status: 'offline'
                });

                console.log(`❌ User ${socket.userId} disconnected`);
            } else {
                console.log(`❌ Socket ${socket.id} disconnected`);
            }
        });
    });

    // Helper function to get online users
    io.getOnlineUsers = () => onlineUsers;

    return io;
};

module.exports = socketHandler;
