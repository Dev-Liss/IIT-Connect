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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socketService from '../../src/services/socketService';
import { MESSAGE_ENDPOINTS } from '../../src/config/api';
import MediaMessage from '../../src/components/MediaMessage';
import AttachmentPicker from '../../src/components/AttachmentPicker';
import MediaPreview from '../../src/components/MediaPreview';
import {
  pickImage,
  pickVideo,
  takePhoto,
  pickDocument,
  uploadFile,
  validateFileSize,
} from '../../src/services/mediaService';

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
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isNearBottom = useRef(true);

  // Media attachment states
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
          setHasMore(data.hasMore || false);
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
      const currentUserId = currentUser?.id || currentUser?._id;
      const isMine = message.sender?._id === currentUserId || message.sender === currentUserId;

      setMessages(prev => {
        // Replace optimistic message with server-confirmed one
        if (isMine) {
          const optimisticIdx = prev.findIndex(m => m._optimistic);
          if (optimisticIdx !== -1) {
            const updated = [...prev];
            updated[optimisticIdx] = message;
            return updated;
          }
        }
        // Deduplicate by _id (prevent double-add from race conditions)
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });

      // Mark as read
      socketService.markAsRead(conversationId);
    };

    socketService.addMessageListener(conversationId, handleNewMessage);

    return () => {
      socketService.removeMessageListener(conversationId, handleNewMessage);
    };
  }, [conversationId, currentUser]);

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

    const currentUserId = currentUser.id || currentUser._id;
    const content = inputText.trim();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Optimistic: show message instantly in UI
    setMessages(prev => [...prev, {
      _id: tempId,
      conversation: conversationId,
      sender: { _id: currentUserId, username: currentUser.username },
      content,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      _optimistic: true,
    }]);
    setInputText('');

    // Send message via socket
    const sent = socketService.sendMessage({
      conversationId,
      content,
      messageType: 'text',
      tempId,
    });

    // Revert optimistic message if socket send failed
    if (!sent) {
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setInputText(content);
    }
  };

  // Handle attachment picker option selection
  const handleAttachmentSelect = async (type) => {
    try {
      let media = null;
      
      switch (type) {
        case 'camera':
          media = await takePhoto();
          break;
        case 'photo':
          media = await pickImage();
          break;
        case 'video':
          media = await pickVideo();
          break;
        case 'document':
          media = await pickDocument();
          break;
      }

      if (media) {
        // Validate file size
        const validation = validateFileSize(media);
        if (!validation.valid) {
          Alert.alert('File Too Large', validation.message);
          return;
        }
        setSelectedMedia(media);
      }
    } catch (error) {
      console.error('Error selecting media:', error);
      Alert.alert('Error', error.message || 'Failed to select media');
    }
  };

  // Remove selected media
  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setUploadProgress(0);
  };

  // Send media message
  const sendMediaMessage = async () => {
    if (!selectedMedia || !currentUser || isUploading) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload to server
      const uploadResult = await uploadFile(selectedMedia, (progress) => {
        setUploadProgress(progress);
      });

      if (uploadResult.success) {
        // Send message via socket with media data
        const messageType = selectedMedia.type === 'document' ? 'document' : selectedMedia.type;
        const currentUserId = currentUser.id || currentUser._id;
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Optimistic: show media message immediately
        setMessages(prev => [...prev, {
          _id: tempId,
          conversation: conversationId,
          sender: { _id: currentUserId, username: currentUser.username },
          content: inputText.trim() || '',
          messageType,
          fileUrl: uploadResult.file.url,
          fileName: uploadResult.file.fileName,
          fileSize: uploadResult.file.fileSize,
          fileMimeType: uploadResult.file.mimeType,
          thumbnailUrl: uploadResult.file.thumbnailUrl,
          mediaMetadata: {
            width: uploadResult.file.width,
            height: uploadResult.file.height,
            duration: uploadResult.file.duration,
          },
          createdAt: new Date().toISOString(),
          _optimistic: true,
        }]);

        socketService.sendMessage({
          conversationId,
          content: inputText.trim() || '',
          messageType,
          fileUrl: uploadResult.file.url,
          fileName: uploadResult.file.fileName,
          fileSize: uploadResult.file.fileSize,
          fileMimeType: uploadResult.file.mimeType,
          thumbnailUrl: uploadResult.file.thumbnailUrl,
          cloudinaryPublicId: uploadResult.file.publicId,
          mediaMetadata: {
            width: uploadResult.file.width,
            height: uploadResult.file.height,
            duration: uploadResult.file.duration,
          },
          tempId,
        });

        // Clear media and input
        setSelectedMedia(null);
        setInputText('');
        setUploadProgress(0);
      } else {
        throw new Error(uploadResult.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error sending media:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to send media');
    } finally {
      setIsUploading(false);
    }
  };

  // Combined send function - handles both text and media
  const handleSend = () => {
    if (selectedMedia) {
      sendMediaMessage();
    } else {
      sendMessage();
    }
  };

  // Load earlier messages (pagination)
  const loadEarlierMessages = useCallback(async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;

    setLoadingMore(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const oldestMessage = messages[0];
      const response = await fetch(
        `${MESSAGE_ENDPOINTS.GET_MESSAGES(conversationId)}?before=${oldestMessage.createdAt}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.success && data.messages.length > 0) {
        setMessages(prev => [...data.messages, ...prev]);
        setHasMore(data.hasMore || false);
      }
    } catch (error) {
      console.error('Error loading earlier messages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, messages, loadingMore, hasMore]);

  // Track scroll position for smart auto-scroll
  const handleScroll = useCallback((event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    isNearBottom.current = distanceFromBottom < 150;
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const currentUserId = currentUser?._id || currentUser?.id;
    const isMe = item.sender?._id === currentUserId || item.sender === currentUserId;
    const senderName = item.sender?.username || name || 'User';
    const hasMedia = item.messageType && item.messageType !== 'text' && item.messageType !== 'system';
    const isVisualMedia = item.messageType === 'image' || item.messageType === 'video';

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.otherMessageContainer]}>
        {!isMe && (
          <View style={styles.otherAvatar}>
            <Text style={styles.otherAvatarText}>{senderName[0]?.toUpperCase() || 'U'}</Text>
          </View>
        )}
        <View style={styles.messageWrapper}>
          <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage, isVisualMedia && styles.mediaBubble]}>
            {item.messageType === 'system' ? (
              <Text style={styles.systemMessageText}>{item.content}</Text>
            ) : hasMedia ? (
              <View>
                <MediaMessage message={item} isMe={isMe} />
                {item.content && item.content.trim() !== '' && (
                  <Text style={[styles.messageText, styles.mediaCaption, isMe ? styles.myMessageText : styles.otherMessageText]}>
                    {item.content}
                  </Text>
                )}
              </View>
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
          onContentSizeChange={() => {
            if (isNearBottom.current) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          onScroll={handleScroll}
          scrollEventThrottle={100}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={15}
          removeClippedSubviews={Platform.OS === 'android'}
          ListHeaderComponent={
            hasMore ? (
              <TouchableOpacity
                onPress={loadEarlierMessages}
                style={{ alignItems: 'center', paddingVertical: 10 }}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color="#D32F2F" />
                ) : (
                  <Text style={{ color: '#D32F2F', fontSize: 14 }}>Load earlier messages</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubText}>Start the conversation!</Text>
            </View>
          }
        />

        {/* Media Preview */}
        {selectedMedia && (
          <MediaPreview
            media={selectedMedia}
            onRemove={handleRemoveMedia}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => setShowAttachmentPicker(true)}
            disabled={isUploading}
          >
            <Ionicons name="add-circle" size={28} color={isUploading ? '#ccc' : '#D32F2F'} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder={selectedMedia ? "Add a caption..." : "Type a message..."}
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={handleInputChange}
            multiline
            editable={!isUploading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              (inputText.trim() === '' && !selectedMedia) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={(inputText.trim() === '' && !selectedMedia) || !isConnected || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#D32F2F" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={(inputText.trim() === '' && !selectedMedia) || !isConnected ? '#ccc' : '#D32F2F'} 
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Attachment Picker Modal */}
        <AttachmentPicker
          visible={showAttachmentPicker}
          onClose={() => setShowAttachmentPicker(false)}
          onSelectOption={handleAttachmentSelect}
        />
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
  mediaBubble: {
    padding: 5,
    backgroundColor: 'transparent',
  },
  mediaCaption: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
});
