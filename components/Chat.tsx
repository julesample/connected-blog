import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../services/supabase';
import { useToast } from '../context/ToastContext';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

const Chat: React.FC = () => {
  const { currentUser } = useUser();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('id, username');
      if (error) {
        showToast('Error fetching users', 'error');
      } else {
        setUsers(data || []);
      }
    };
    fetchUsers();
  }, [showToast]);

  useEffect(() => {
    if (currentUser && receiverId) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`(sender_id.eq.${currentUser.id},and(receiver_id.eq.${receiverId})), (sender_id.eq.${receiverId},and(receiver_id.eq.${currentUser.id}))`)
          .order('created_at', { ascending: true });

        if (error) {
          showToast('Error fetching messages', 'error');
        } else {
          setMessages(data || []);
        }
      };
      fetchMessages();

      const subscription = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const newMessage = payload.new as Message;
          if (
            (newMessage.sender_id === currentUser.id && newMessage.receiver_id === receiverId) ||
            (newMessage.sender_id === receiverId && newMessage.receiver_id === currentUser.id)
          ) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [currentUser, receiverId, showToast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUser!.id,
      receiver_id: receiverId,
      content: newMessage,
    });

    if (error) {
      showToast('Error sending message', 'error');
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-slate-100 dark:bg-slate-800 p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <ul>
          {users.map((u) => (
            <li
              key={u.id}
              className={`p-2 cursor-pointer ${receiverId === u.id ? 'bg-primary-500 text-white' : ''}`}
              onClick={() => setReceiverId(u.id)}
            >
              {u.username}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 my-2 rounded-lg ${
                msg.sender_id === currentUser?.id ? 'bg-primary-500 text-white self-end' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-100 dark:bg-slate-800">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-2 rounded-lg"
          />
        </form>
      </div>
    </div>
  );
};

export default Chat;
