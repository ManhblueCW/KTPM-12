import Message from '../models/Message.js';
import axios from 'axios';

class MessageService {
  async getChatList(userId) {
    console.log('[Social Service] Getting chat list for user:', userId);
    
    try {
      // Get user avatar from User Service
      let userAvatar = '';
      try {
        const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        userAvatar = response.data.avatar;
      } catch (error) {
        console.error('[Social Service] Error getting user avatar:', error.message);
      }

      // Retrieve messages where the user is either the sender or receiver
      const messages = await Message.find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      }).populate('senderId', 'name avatar')
        .populate('receiverId', 'name avatar')
        .lean();

      console.log('[Social Service] Found', messages.length, 'messages');

      // Reduce messages to a unique list of chat partners
      const uniqueChatPartners = new Set();
      const chatListData = [];

      messages.forEach(message => {
        const partner = message.senderId._id.toString() === userId ? message.receiverId : message.senderId;
        const partnerId = partner._id.toString();

        // If this partner hasn't been added yet, add them to the results
        if (!uniqueChatPartners.has(partnerId)) {
          uniqueChatPartners.add(partnerId);
          chatListData.push({
            partnerId,
            partnerName: partner.name,
            partnerAvatar: partner.avatar
          });
        }
      });

      console.log('[Social Service] Found', chatListData.length, 'unique chat partners');
      return { success: true, data: { userAvatar, chatListData }, status: 200 };
    } catch (error) {
      console.error('[Social Service] Error getting chat list:', error);
      return { success: false, error: 'Failed to fetch chat data', status: 400 };
    }
  }

  async getMessagesBetweenUsers(userId, partnerId) {
    console.log('[Social Service] Getting messages between', userId, 'and', partnerId);
    
    try {
      const messages = await Message.find({
        $or: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId }
        ]
      }).sort({ timestamp: 1 });

      console.log('[Social Service] Found', messages.length, 'messages');
      return { success: true, data: messages, status: 200 };
    } catch (error) {
      console.error('[Social Service] Error getting messages:', error);
      return { success: false, error: 'Failed to retrieve messages', status: 400 };
    }
  }

  async sendMessage(senderId, receiverId, messageText) {
    console.log('[Social Service] Sending message from', senderId, 'to', receiverId);
    
    try {
      const newMessage = new Message({
        senderId,
        receiverId,
        message: messageText,
        timestamp: new Date()
      });

      await newMessage.save();
      console.log('[Social Service] Message saved:', newMessage._id);
      
      return { success: true, data: newMessage, status: 201 };
    } catch (error) {
      console.error('[Social Service] Error sending message:', error);
      return { success: false, error: 'Failed to send message', status: 400 };
    }
  }
}

export default new MessageService();