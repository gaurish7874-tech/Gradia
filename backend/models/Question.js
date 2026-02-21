import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: [{
      type: String,
      required: true,
    }],
    correctAnswer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
