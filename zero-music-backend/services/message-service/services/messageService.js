import axios from 'axios';

export const getUserInfo = async (userId) => {
  console.log(`📡 [Message Service] Fetching user info for ${userId}`);
  try {
    const response = await axios.get(
      `${process.env.USER_SERVICE_URL}/internal/users/${userId}`
    );
    console.log('✅ [Message Service] User info fetched');
    return response.data;
  } catch (error) {
    console.error('❌ [Message Service] Error fetching user info:', error.message);
    return null;
  }
};

export const saveMessage = async (Message, senderId, receiverId, text) => {
  console.log(`💾 [Message Service] Saving message from ${senderId} to ${receiverId}`);
  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      message: text
    });

    await newMessage.save();
    console.log('✅ [Message Service] Message saved:', newMessage._id);
    return newMessage;
  } catch (error) {
    console.error('❌ [Message Service] Error saving message:', error);
    throw error;
  }
};