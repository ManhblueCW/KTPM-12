import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
    // SỬA ĐỔI: Chuyển về String, loại bỏ 'ref'
  senderId: { type: String, required: true }, 
  receiverId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Message || mongoose.model("Message", messageSchema);