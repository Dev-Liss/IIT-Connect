import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socketService from '../../src/services/socketService';
import { MESSAGE_ENDPOINTS } from '../../src/config/api';

export default function ChatScreen() {
  const router = useRouter();
  const { id: conversationId, name, type } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnected, setIsConnected] = useState(socketService.getConnectionStatus());
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load current user and connect to socket
  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          
          // Connect to socket if not already connected - use id or _id
          const userId = user.id || user._id;
          if (!socketService.getConnectionStatus() && userId) {
            socketService.connect(userId);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    initialize();
  }, []);

  // Fetch messages and join conversation room
  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        
        const response = await fetch(MESSAGE_ENDPOINTS.GET_MESSAGES(conversationId), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    
    // Join conversation room
    socketService.joinConversation(conversationId);
    socketService.markAsRead(conversationId);

    return () => {
      // Leave conversation room when unmounting
      socketService.leaveConversation(conversationId);
    };
  }, [conversationId, currentUser]);

  // Set up message listener
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      
      // Mark as read
      socketService.markAsRead(conversationId);
    };

    socketService.addMessageListener(conversationId, handleNewMessage);

    return () => {
      socketService.removeMessageListener(conversationId, handleNewMessage);
    };
  }, [conversationId]);

  // Set up typing indicator listener
  useEffect(() => {
    if (!conversationId) return;

    const handleTyping = ({ userId, username, isTyping }) => {
      const currentUserId = currentUser?.id || currentUser?._id;
      if (userId !== currentUserId) {
        setIsTyping(isTyping);
        setTypingUser(isTyping ? username : null);
      }
    };

    socketService.addTypingListener(conversationId, handleTyping);

    return () => {
      socketService.removeTypingListener(conversationId, handleTyping);
    };
  }, [conversationId, currentUser]);

  // Connection status listener
  useEffect(() => {
    const handleConnection = (connected) => {
      setIsConnected(connected);
    };

    socketService.addConnectionListener(handleConnection);

    return () => {
      socketService.removeConnectionListener(handleConnection);
    };
  }, []);

  // Handle typing indicator
  const handleInputChange = (text) => {
    setInputText(text);

    if (!currentUser) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start
    if (text.length > 0) {
      socketService.sendTypingIndicator(conversationId, true, currentUser.username);
    }

    // Send typing stop after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTypingIndicator(conversationId, false, currentUser.username);
    }, 2000);
  };

  const sendMessage = () => {
    if (inputText.trim() === '' || !currentUser) return;

    // Clear typing indicator
    socketService.sendTypingIndicator(conversationId, false, currentUser.username);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send message via socket
    const sent = socketService.sendMessage({
      conversationId,
      content: inputText.trim(),
      messageType: 'text',
    });

    if (sent) {
      setInputText('');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender?._id === currentUser?._id || item.sender === currentUser?._id;
    const senderName = item.sender?.username || name || 'User';

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.otherMessageContainer]}>
        {!isMe && (
          <View style={styles.otherAvatar}>
            <Text style={styles.otherAvatarText}>{senderName[0]?.toUpperCase() || 'U'}</Text>
          </View>
        )}
        <View style={styles.messageWrapper}>
          <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
            {item.messageType === 'file' || item.fileUrl ? (
              <TouchableOpacity style={styles.fileContainer}>
                <View style={styles.fileIcon}>
                  <Ionicons name="document-text" size={24} color="#D32F2F" />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, isMe && styles.myFileName]}>{item.fileName || 'File'}</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={isMe ? '#fff' : '#D32F2F'} />
              </TouchableOpacity>
            ) : item.messageType === 'system' ? (
              <Text style={styles.systemMessageText}>{item.content}</Text>
            ) : (
              <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                {item.content}
              </Text>
            )}
          </View>
          <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.otherMessageTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D32F2F" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={[styles.headerStatus, !isConnected && styles.headerStatusOffline]}>
              {isTyping ? `${typingUser || 'Someone'} is typing...` : isConnected ? 'Online' : 'Connecting...'}
            </Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Connection Status Banner */}
        {!isConnected && (
          <View style={styles.connectionBanner}>
            <Text style={styles.connectionBannerText}>Reconnecting...</Text>
          </View>
        )}

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubText}>Start the conversation!</Text>
            </View>
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={handleInputChange}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={inputText.trim() === '' || !isConnected}
          >
            <Ionicons name="send" size={20} color={inputText.trim() === '' || !isConnected ? '#ccc' : '#D32F2F'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  moreButton: {
    padding: 5,
  },
  messagesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  otherAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  otherAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageWrapper: {
    maxWidth: '75%',
  },
  messageBubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: '#D32F2F',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#999',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
    textAlign: 'left',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 8,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  myFileName: {
    color: '#fff',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  myFileSize: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15, // Base padding, will be overridden by insets.bottom
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  attachButton: {
    padding: 5,
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#000',
  },
  sendButton: {
    padding: 10,
    marginLeft: 5,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  headerStatusOffline: {
    color: '#999',
  },
  connectionBanner: {
    backgroundColor: '#FFF3CD',
    padding: 8,
    alignItems: 'center',
  },
  connectionBannerText: {
    color: '#856404',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  systemMessageText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
  },
});
