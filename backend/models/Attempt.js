import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    timeTaken: {
      type: Number,
      required: true,
      min: 0,
    },
    attempts: {
      type: Number,
      default: 1,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    predictedLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    aiFeedback: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Attempt', attemptSchema);
