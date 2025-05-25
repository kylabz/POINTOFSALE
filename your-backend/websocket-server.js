import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';

const WS_URL = 'ws://localhost:5002'; // Use your server's IP on real devices

export default function ChatSupport() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data.message || event.data]);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && input.trim()) {
      ws.current.send(JSON.stringify({ message: input.trim() }));
      setInput('');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ScrollView style={{ flex: 1 }}>
        {messages.map((msg, idx) => (
          <Text key={idx} style={{ marginVertical: 2 }}>{msg}</Text>
        ))}
      </ScrollView>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type a message"
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8 }}
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}