/**
 * ====================================
 * SOCKET SERVICE
 * ====================================
 * Centralized socket.io client management for real-time messaging
 */

import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentUserId = null;
        this.messageListeners = new Map();
        this.typingListeners = new Map();
        this.connectionListeners = [];
    }

    /**
     * Initialize socket connection
     * @param {string} userId - Current user's ID
     */
    connect(userId) {
        if (this.socket && this.isConnected) {
            console.log('Socket already connected');
            return;
        }

        this.currentUserId = userId;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
            this.isConnected = true;

            // Notify server that user is online
            this.socket.emit('user_online', userId);

            // Notify connection listeners
            this.connectionListeners.forEach(listener => listener(true));
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;

            // Notify connection listeners
            this.connectionListeners.forEach(listener => listener(false));
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            this.isConnected = false;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Global message handler - distributes to conversation-specific listeners
        this.socket.on('receive_message', (data) => {
            const { message } = data;
            const conversationId = message.conversation;

            // Notify all listeners for this conversation
            const listeners = this.messageListeners.get(conversationId) || [];
            listeners.forEach(listener => listener(message));
        });

        // Typing indicator handler
        this.socket.on('user_typing', (data) => {
            const { conversationId, userId, username, isTyping } = data;

            const listeners = this.typingListeners.get(conversationId) || [];
            listeners.forEach(listener => listener({ userId, username, isTyping }));
        });

        // New message notification (for unread badges)
        this.socket.on('new_message_notification', (data) => {
            // Handle notifications for messages in conversations not currently open
            console.log('📬 New message notification:', data);
        });

        // User status changes
        this.socket.on('user_status_change', (data) => {
            console.log('👤 User status:', data.userId, data.status);
        });

        return this.socket;
    }

    /**
     * Disconnect socket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentUserId = null;
            this.messageListeners.clear();
            this.typingListeners.clear();
            console.log('Socket disconnected and cleaned up');
        }
    }

    /**
     * Join a conversation room
     * @param {string} conversationId 
     */
    joinConversation(conversationId) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket not connected, cannot join conversation');
            return;
        }

        this.socket.emit('join_conversation', {
            conversationId,
            userId: this.currentUserId
        });
    }

    /**
     * Leave a conversation room
     * @param {string} conversationId 
     */
    leaveConversation(conversationId) {
        if (!this.socket || !this.isConnected) {
            return;
        }

        this.socket.emit('leave_conversation', {
            conversationId,
            userId: this.currentUserId
        });
    }

    /**
     * Send a message
     * @param {Object} messageData - { conversationId, content, messageType, fileUrl, fileName }
     */
    sendMessage(messageData) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket not connected, cannot send message');
            return false;
        }

        this.socket.emit('send_message', {
            ...messageData,
            senderId: this.currentUserId
        });

        return true;
    }

    /**
     * Send typing indicator
     * @param {string} conversationId 
     * @param {boolean} isTyping 
     * @param {string} username 
     */
    sendTypingIndicator(conversationId, isTyping, username) {
        if (!this.socket || !this.isConnected) {
            return;
        }

        const event = isTyping ? 'typing_start' : 'typing_stop';
        this.socket.emit(event, {
            conversationId,
            userId: this.currentUserId,
            username
        });
    }

    /**
     * Mark messages as read
     * @param {string} conversationId 
     */
    markAsRead(conversationId) {
        if (!this.socket || !this.isConnected) {
            return;
        }

        this.socket.emit('mark_read', {
            conversationId,
            userId: this.currentUserId
        });
    }

    /**
     * Start a direct chat with another user
     * @param {string} otherUserId 
     */
    startDirectChat(otherUserId) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket not connected');
            return;
        }

        this.socket.emit('start_direct_chat', {
            userId1: this.currentUserId,
            userId2: otherUserId
        });
    }

    /**
     * Create a group conversation
     * @param {Object} groupData - { name, description, participants, category }
     */
    createGroup(groupData) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket not connected');
            return;
        }

        this.socket.emit('create_group', {
            ...groupData,
            adminId: this.currentUserId
        });
    }

    /**
     * Add a listener for messages in a specific conversation
     * @param {string} conversationId 
     * @param {Function} callback 
     */
    addMessageListener(conversationId, callback) {
        if (!this.messageListeners.has(conversationId)) {
            this.messageListeners.set(conversationId, []);
        }
        this.messageListeners.get(conversationId).push(callback);
    }

    /**
     * Remove message listener for a conversation
     * @param {string} conversationId 
     * @param {Function} callback 
     */
    removeMessageListener(conversationId, callback) {
        const listeners = this.messageListeners.get(conversationId);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Add a listener for typing indicators in a conversation
     * @param {string} conversationId 
     * @param {Function} callback 
     */
    addTypingListener(conversationId, callback) {
        if (!this.typingListeners.has(conversationId)) {
            this.typingListeners.set(conversationId, []);
        }
        this.typingListeners.get(conversationId).push(callback);
    }

    /**
     * Remove typing listener
     * @param {string} conversationId 
     * @param {Function} callback 
     */
    removeTypingListener(conversationId, callback) {
        const listeners = this.typingListeners.get(conversationId);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Add connection state listener
     * @param {Function} callback - receives boolean isConnected
     */
    addConnectionListener(callback) {
        this.connectionListeners.push(callback);
    }

    /**
     * Remove connection state listener
     * @param {Function} callback 
     */
    removeConnectionListener(callback) {
        const index = this.connectionListeners.indexOf(callback);
        if (index > -1) {
            this.connectionListeners.splice(index, 1);
        }
    }

    /**
     * Listen for new conversation created
     * @param {Function} callback 
     */
    onConversationCreated(callback) {
        if (this.socket) {
            this.socket.on('conversation_created', callback);
        }
    }

    /**
     * Listen for group created
     * @param {Function} callback 
     */
    onGroupCreated(callback) {
        if (this.socket) {
            this.socket.on('group_created', callback);
        }
    }

    /**
     * Check if socket is connected
     * @returns {boolean}
     */
    getConnectionStatus() {
        return this.isConnected;
    }

    /**
     * Get socket instance (for advanced usage)
     * @returns {Socket}
     */
    getSocket() {
        return this.socket;
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
