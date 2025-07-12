import { supabase } from './supabase';

export const getMessages = async (userId1: string, userId2: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`(sender_id.eq.${userId1},and(receiver_id.eq.${userId2})), (sender_id.eq.${userId2},and(receiver_id.eq.${userId1}))`)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }
  return data;
};

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id: senderId, receiver_id: receiverId, content }]);

  if (error) {
    throw error;
  }
  return data;
};
