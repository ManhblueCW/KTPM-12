import Message from '../models/Message.js';

export async function getChatPartners(userId) {
  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }]
  }).populate('senderId', 'name avatar')
    .populate('receiverId', 'name avatar')
    .lean();

  const uniqueChatPartners = new Set();
  const chatListData = [];

  messages.forEach(message => {
    const partner = message.senderId._id.toString() === userId ? message.receiverId : message.senderId;
    const partnerId = partner._id.toString();

    if (!uniqueChatPartners.has(partnerId)) {
      uniqueChatPartners.add(partnerId);
      chatListData.push({
        partnerId,
        partnerName: partner.name,
        partnerAvatar: partner.avatar
      });
    }
  });

  return chatListData;
}

export async function getMessagesBetweenUsers(userId, partnerId) {
  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: partnerId },
      { senderId: partnerId, receiverId: userId }
    ]
  }).sort({ timestamp: 1 });
  return messages;
}

export async function sendMessage(userId, receiverId, text) {
  const newMessage = new Message({
    senderId: userId,
    receiverId,
    message: text
  });
  await newMessage.save();
  return newMessage;
}
