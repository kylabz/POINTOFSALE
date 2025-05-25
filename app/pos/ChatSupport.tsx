import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';

import { io, Socket } from 'socket.io-client';

// Set your backend URL here:
const BACKEND_URL = 'http://192.168.162.56:5001'; // <-- Updated backend address

export default function ChatSupport() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to chat server');
    });

    socketRef.current.on('chat message', (msg: string) => {
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.on('disconnect', () => {
      console.log('⚠️ Disconnected from chat server');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    // Emit to WebSocket
    socketRef.current?.emit('chat message', input.trim());

    // POST to backend
    fetch(`${BACKEND_URL}/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: input.trim() }),
    })
      .then(response => response.json())
      .then(data => console.log('✅ Server response:', data))
      .catch(error => console.error('❌ Error:', error));

    setMessages(prev => [
      ...prev,
      `You: ${input.trim()}`
    ]);
    setInput('');

    // Add automatic system reply after 1 second
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        `System: Please wait while we connect you to a representative about this system...`
      ]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Customer Service Chat</Text>
      </View>

      <ScrollView style={styles.chatBox} contentContainerStyle={{ padding: 10 }}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.startsWith('System:') && { backgroundColor: '#ffe082', alignSelf: 'center' }
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.startsWith('System:') && { color: '#6d4c00', fontStyle: 'italic' }
              ]}
            >
              {msg}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#00bcd4',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatBox: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageBubble: {
    backgroundColor: '#e1f5fe',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  messageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#00bcd4',
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginLeft: 10,
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
