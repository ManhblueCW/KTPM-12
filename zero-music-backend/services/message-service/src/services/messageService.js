import Message from '../models/Message.js';
import axios from 'axios';
import 'dotenv/config';

export async function getChatPartners(userId, token) { 
  const userServiceUrl = process.env.USER_SERVICE_URL;

  // 1. TÌM TẤT CẢ TIN NHẮN (BỎ HẲN .populate())
  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }]
  }).sort({ timestamp: -1 })
    .lean();

  const partnerIds = new Set();

  // 2. TRÍCH XUẤT ID ĐỐI TÁC DUY NHẤT (senderId/receiverId giờ là chuỗi)
  messages.forEach(message => {
    // Sửa logic truy cập: KHÔNG cần ._id.toString() nữa
    const partnerId = message.senderId === userId 
      ? message.receiverId 
      : message.senderId;

    if (!partnerIds.has(partnerId)) {
      partnerIds.add(partnerId);
    }
  });
    
  if (partnerIds.size === 0) return [];

  // 3. GỌI AXIOS ĐỂ LẤY THÔNG TIN USER (Lấy tên, avatar)
    const partnerInfoPromises = Array.from(partnerIds).map(id => 
        // ➡️ DÙNG PREFIX ĐÚNG: /api/users
        axios.get(`${userServiceUrl}/${id}`, { 
            headers: { Authorization: token } 
        }).catch(error => {
            // Xử lý nếu user bị xóa (404) hoặc lỗi khác
            console.error(`Error fetching user ${id}:`, error.message);
            return { data: { success: false } }; // Trả về data lỗi để Promise.all không bị dừng
        })
    );

    const partnerResponses = await Promise.all(partnerInfoPromises);

    // 4. MAP DỮ LIỆU ĐÃ LẤY ĐƯỢC
    const chatListData = partnerResponses.map(resp => {
        const user = resp.data?.user;
        if (user) {
            return {
                partnerId: user._id,
                partnerName: user.name || user.username, // Lấy tên hoặc username
                partnerAvatar: user.avatar,
                // Thêm các thông tin cần thiết khác
            };
        }
        return null; // Bỏ qua user không tồn tại/lỗi
    }).filter(p => p !== null); // Loại bỏ các mục null

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
