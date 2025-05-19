import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  websites: { type: [String], required: true },
  duration: { type: String, default: '30 minutes' },
  chats: { type: [String], default: [] },   // <-- NEW FIELD
  tasks: { type: [String], default: [] },   // <-- NEW FIELD
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;