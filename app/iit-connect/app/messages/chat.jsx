import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { styles } from '@/styles/chat.styles';

const DUMMY_MESSAGES = [
  {
    id: '1',
    text: 'Hey! How are you doing?',
    sender: 'other',
    time: '10:15 AM',
  },
  {
    id: '2',
    text: "I'm good! Just finished the assignment.",
    sender: 'me',
    time: '10:16 AM',
  },
  {
    id: '3',
    text: "That's great! Can you share your notes?",
    sender: 'other',
    time: '10:17 AM',
  },
  {
    id: '4',
    text: 'Sure! Here you go',
    sender: 'me',
    time: '10:18 AM',
  },
  {
    id: '5',
    text: null,
    sender: 'me',
    time: '10:18 AM',
    file: {
      name: 'CS101_Notes.pdf',
      size: '2.4 MB',
    },
  },
  {
    id: '6',
    text: 'Thanks a lot! Really appreciate it 🙏',
    sender: 'other',
    time: '10:20 AM',
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const { id, name, type } = useLocalSearchParams();
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.otherMessageContainer]}>
        {!isMe && (
          <View style={styles.otherAvatar}>
            <Text style={styles.otherAvatarText}>{name ? name[0] : 'U'}</Text>
          </View>
        )}
        <View style={styles.messageWrapper}>
          <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
            {item.file ? (
              <TouchableOpacity style={styles.fileContainer}>
                <View style={styles.fileIcon}>
                  <Ionicons name="document-text" size={24} color="#D32F2F" />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, isMe && styles.myFileName]}>{item.file.name}</Text>
                  <Text style={[styles.fileSize, isMe && styles.myFileSize]}>{item.file.size}</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={isMe ? '#fff' : '#D32F2F'} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                {item.text}
              </Text>
            )}
          </View>
          <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.otherMessageTime]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.headerStatus}>Active now</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={inputText.trim() === ''}
          >
            <Ionicons name="send" size={20} color={inputText.trim() === '' ? '#ccc' : '#D32F2F'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
