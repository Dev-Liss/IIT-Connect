# 📱 IIT Connect - Real-Time Messaging System

## Overview

This document describes the complete implementation of the **Direct Messaging & Group Chat** feature for the IIT Connect mobile application. The system uses **Socket.io** for real-time WebSocket communication, enabling instant message delivery, typing indicators, and read receipts.

---

## 🎯 What Was Implemented

### Core Features

- ✅ **Direct Messaging (1-on-1 Chats)** - Private conversations between two users
- ✅ **Group Chats** - Multi-participant conversations with admin controls
- ✅ **Club Chats** - Official organization/club communication channels
- ✅ **Real-time Message Delivery** - Instant message sending and receiving via WebSockets
- ✅ **Typing Indicators** - Shows when someone is typing
- ✅ **Read Receipts** - Track who has read messages
- ✅ **Online/Offline Status** - Real-time user presence tracking
- ✅ **Message History** - Fetch previous messages with pagination
- ✅ **File Attachments Support** - Schema ready for images, documents, etc.

---

## 🏗️ Architecture

### Technology Stack

| Component               | Technology           |
| ----------------------- | -------------------- |
| Backend Server          | Node.js + Express.js |
| Real-time Communication | Socket.io            |
| Database                | MongoDB + Mongoose   |
| Mobile App              | React Native + Expo  |
| Mobile Socket Client    | socket.io-client     |
| Navigation              | expo-router          |

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Messages    │  │ Chat        │  │ Socket Service          │  │
│  │ Screen      │──│ Screen      │──│ (socketService.js)      │  │
│  │ (List)      │  │ (Convo)     │  │ - connect/disconnect    │  │
│  └─────────────┘  └─────────────┘  │ - send/receive messages │  │
│                                     │ - typing indicators     │  │
│                                     └───────────┬─────────────┘  │
└─────────────────────────────────────────────────┼────────────────┘
                                                  │ WebSocket
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Express     │  │ Socket.io   │  │ Socket Handler          │  │
│  │ REST API    │──│ Server      │──│ (socketHandler.js)      │  │
│  │ /api/*      │  │             │  │ - Event listeners       │  │
│  └──────┬──────┘  └─────────────┘  │ - Room management       │  │
│         │                          └───────────┬─────────────┘  │
│         │                                      │                 │
│         ▼                                      ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      MongoDB Database                        ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  ││
│  │  │ Users       │  │Conversations│  │ Messages            │  ││
│  │  │ Collection  │  │ Collection  │  │ Collection          │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Files Created & Modified

### Backend Files

#### 1. `backend/models/Message.js` (NEW)

MongoDB schema for storing chat messages.

**Schema Fields:**

- `conversation` - Reference to the Conversation
- `sender` - Reference to the User who sent the message
- `content` - The message text
- `messageType` - Enum: 'text', 'image', 'file', 'system'
- `fileUrl` / `fileName` - For file attachments
- `readBy` - Array tracking which users read the message and when
- `systemMessageType` - For system messages like "user joined"
- `timestamps` - Auto-managed createdAt/updatedAt

#### 2. `backend/models/Conversation.js` (NEW)

MongoDB schema for conversations/chat rooms.

**Schema Fields:**

- `participants` - Array of User references
- `type` - Enum: 'direct', 'group', 'club'
- `name` / `description` - For groups and clubs
- `admin` - User who created/manages the group
- `moderators` - Array of moderator users
- `latestMessage` - Reference to the most recent message
- `isOfficial` - Boolean for official IIT groups
- `category` - For organizing groups (academic, social, etc.)
- `isPublic` - Whether the group can be discovered

**Static Methods:**

- `findOrCreateDirect(userId1, userId2)` - Gets or creates a direct chat
- `getUserConversations(userId)` - Gets all conversations for a user

**Instance Methods:**

- `addParticipant(userId)` - Add user to group
- `removeParticipant(userId)` - Remove user from group

#### 3. `backend/socket/socketHandler.js` (NEW)

Core WebSocket event handling logic.

**Socket Events Implemented:**

| Event                  | Direction       | Description                                |
| ---------------------- | --------------- | ------------------------------------------ |
| `user_online`          | Client → Server | User connects, tracked in online users map |
| `join_conversation`    | Client → Server | User joins a chat room                     |
| `leave_conversation`   | Client → Server | User leaves a chat room                    |
| `send_message`         | Client → Server | User sends a message                       |
| `receive_message`      | Server → Client | Broadcast new message to room              |
| `typing_start`         | Client → Server | User started typing                        |
| `typing_stop`          | Client → Server | User stopped typing                        |
| `user_typing`          | Server → Client | Broadcast typing status                    |
| `mark_read`            | Client → Server | Mark messages as read                      |
| `messages_read`        | Server → Client | Notify others of read status               |
| `start_direct_chat`    | Client → Server | Create 1-on-1 conversation                 |
| `create_group`         | Client → Server | Create group conversation                  |
| `conversation_created` | Server → Client | Notify of new conversation                 |
| `add_to_group`         | Client → Server | Add participant to group                   |
| `remove_from_group`    | Client → Server | Remove participant                         |
| `user_status_change`   | Server → Client | Online/offline notifications               |

#### 4. `backend/routes/conversation.js` (NEW)

REST API endpoints for conversation management.

| Method | Endpoint                                      | Description                  |
| ------ | --------------------------------------------- | ---------------------------- |
| GET    | `/api/conversations`                          | Get all user's conversations |
| GET    | `/api/conversations/:id`                      | Get single conversation      |
| POST   | `/api/conversations/direct`                   | Create/get direct chat       |
| POST   | `/api/conversations/group`                    | Create new group             |
| PUT    | `/api/conversations/:id`                      | Update group details         |
| POST   | `/api/conversations/:id/participants`         | Add participant              |
| DELETE | `/api/conversations/:id/participants/:userId` | Remove participant           |
| DELETE | `/api/conversations/:id`                      | Delete conversation          |

#### 5. `backend/routes/message.js` (NEW)

REST API endpoints for message management.

| Method | Endpoint                               | Description                  |
| ------ | -------------------------------------- | ---------------------------- |
| GET    | `/api/messages/:conversationId`        | Get messages (paginated)     |
| POST   | `/api/messages/:conversationId`        | Send message (REST fallback) |
| PUT    | `/api/messages/:messageId/read`        | Mark message as read         |
| DELETE | `/api/messages/:messageId`             | Delete message (soft delete) |
| GET    | `/api/messages/:conversationId/search` | Search messages              |

#### 6. `backend/server.js` (MODIFIED)

Updated to integrate Socket.io with Express.

**Changes Made:**

- Added `http` module to create HTTP server
- Initialized Socket.io server with CORS configuration
- Imported and initialized socket handler
- Added conversation and message routes
- Changed from `app.listen()` to `server.listen()`

---

### Mobile App Files

#### 1. `mobile-app/src/services/socketService.js` (NEW)

Singleton service managing all socket connections.

**Key Methods:**

```javascript
connect(userId); // Initialize socket connection
disconnect(); // Clean disconnect
joinConversation(id); // Join a chat room
leaveConversation(id); // Leave a chat room
sendMessage(data); // Send a message
sendTypingIndicator(); // Send typing status
markAsRead(id); // Mark messages read
startDirectChat(userId); // Start 1-on-1 chat
createGroup(data); // Create group chat
addMessageListener(); // Subscribe to messages
addTypingListener(); // Subscribe to typing
addConnectionListener(); // Subscribe to connection status
getConnectionStatus(); // Check if connected
```

#### 2. `mobile-app/src/config/api.js` (MODIFIED)

Added new endpoint configurations.

**New Exports:**

- `SOCKET_URL` - WebSocket server URL
- `CONVERSATION_ENDPOINTS` - REST endpoints for conversations
- `MESSAGE_ENDPOINTS` - REST endpoints for messages

#### 3. `mobile-app/app/messages/chat.jsx` (MODIFIED)

Complete rewrite for real-time functionality.

**New Features:**

- Loads user data from AsyncStorage
- Connects to socket on mount
- Joins conversation room
- Real-time message receiving via socket
- Sends messages via socket (not REST)
- Typing indicator display
- Connection status banner
- Loading states
- Empty state UI
- Auto-scroll to latest message

#### 4. `mobile-app/app/(tabs)/messages.jsx` (MODIFIED)

Updated to fetch real conversations from API.

**New Features:**

- Fetches conversations from REST API
- Pull-to-refresh functionality
- Loading state with spinner
- Empty state when no conversations
- Real-time conversation updates via socket
- Smart name display (shows other user's name for direct chats)
- Time formatting (relative times like "Yesterday", "2 days ago")

---

## 📦 Dependencies Installed

### Backend

```bash
npm install socket.io bcryptjs jsonwebtoken
```

| Package      | Version | Purpose                              |
| ------------ | ------- | ------------------------------------ |
| socket.io    | ^4.x    | WebSocket server                     |
| bcryptjs     | ^2.x    | Password hashing (for future auth)   |
| jsonwebtoken | ^9.x    | JWT token handling (for future auth) |

### Mobile App

```bash
npm install socket.io-client
```

| Package          | Version | Purpose          |
| ---------------- | ------- | ---------------- |
| socket.io-client | ^4.x    | WebSocket client |

---

## 🔄 How It Works

### Message Flow

1. **User Opens Chat Screen**
   - App loads user data from AsyncStorage
   - Socket connects to server (if not already)
   - App fetches message history via REST API
   - Socket joins the conversation room
   - Messages marked as read

2. **User Sends Message**
   - User types in input field
   - Typing indicator sent to other participants
   - User taps send button
   - Message sent via socket `send_message` event
   - Server saves to MongoDB
   - Server broadcasts to room via `receive_message`
   - All clients in room update their UI

3. **User Receives Message**
   - Socket listener receives `receive_message` event
   - Message added to local state
   - UI updates with new message
   - Read receipt sent to server

### Typing Indicators

1. User starts typing → `typing_start` event sent
2. Server broadcasts `user_typing` to room
3. Other users see "X is typing..."
4. After 2 seconds of no typing → `typing_stop` sent
5. Indicator disappears

### Connection Management

- Socket auto-reconnects on disconnect (5 attempts)
- Connection status shown in UI
- Messages queued during brief disconnects
- Graceful cleanup on screen unmount

---

## 🧪 Testing Instructions

### Prerequisites

1. MongoDB running locally or connection string in `.env`
2. Node.js installed
3. Expo CLI installed
4. Mobile device/emulator on same network as laptop

### Step 1: Configure IP Address

Edit `mobile-app/src/config/api.js`:

```javascript
const LAPTOP_IP = "YOUR_IP_ADDRESS"; // e.g., "192.168.1.100"
```

Find your IP:

- **Windows:** `ipconfig` → Look for IPv4 Address
- **Mac/Linux:** `ifconfig` or `ip addr`

### Step 2: Start Backend

```bash
cd backend
npm install
npm run dev
```

Expected output:

```
✅ Server running on http://0.0.0.0:5000
🔌 Socket.io ready for connections
📱 Mobile app should connect to: http://YOUR_IP:5000/api
```

### Step 3: Start Mobile App

```bash
cd mobile-app
npm install
npx expo start
```

### Step 4: Test Messaging

1. Register/login with two different users
2. Start a direct chat between them
3. Send messages back and forth
4. Observe real-time updates

---

## 🔒 Security Notes

- All message routes are protected with `authMiddleware`
- Users can only access conversations they're participants in
- Only admins can remove participants from groups
- Only message senders can delete their messages
- Socket connections should be authenticated (TODO: add socket auth middleware)

---

## 🚀 Future Enhancements

- [ ] Socket authentication middleware
- [ ] Push notifications for new messages
- [ ] File upload implementation
- [ ] Message reactions/emojis
- [ ] Message reply/threading
- [ ] Voice messages
- [ ] Video/voice calling
- [ ] Message search across all conversations
- [ ] Mute conversation notifications
- [ ] Block user functionality

---

## 📝 Summary

The messaging system is **fully functional** for real-time communication between users. The architecture separates concerns cleanly:

- **Socket.io** handles real-time events (messages, typing, presence)
- **REST API** handles CRUD operations and data fetching
- **MongoDB** persists all data
- **React Native** provides the mobile UI

The system supports **direct chats**, **group chats**, and **club chats**, with infrastructure ready for file attachments and advanced features.

---

_Last Updated: February 2026_
_Branch: chanul-messages_
