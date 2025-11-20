import Message from '../models/Message.js';

export async function sendMessage(senderId, receiverId, text) {
  console.log('[Social Service] Sending message from', senderId, 'to', receiverId);
  
  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      message: text
    });

    await newMessage.save();
    console.log('[Social Service] Message saved successfully');
  } catch (error) {
    console.error('[Social Service] Error saving the message:', error);
  }
}