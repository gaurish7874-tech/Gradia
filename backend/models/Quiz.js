import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [{
      topic: String,
      difficulty: String,
      questionText: String,
      text: String,
      options: [String],
      correctAnswer: String,
      explanation: String,
    }],
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
