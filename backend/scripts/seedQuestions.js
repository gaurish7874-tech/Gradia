import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question.js';

dotenv.config();

const questions = [
  { topic: 'loops', difficulty: 'easy', questionText: 'What is the output of: for(i=0;i<3;i++) console.log(i);', options: ['0 1 2', '1 2 3', '0 1 2 3', '1 2'], correctAnswer: '0 1 2' },
  { topic: 'loops', difficulty: 'easy', questionText: 'Which loop runs at least once?', options: ['for', 'while', 'do-while', 'forEach'], correctAnswer: 'do-while' },
  { topic: 'loops', difficulty: 'medium', questionText: 'How many times does the body execute in: for(let i=0; i<5; i+=2) {}?', options: ['2', '3', '5', '0'], correctAnswer: '3' },
  { topic: 'loops', difficulty: 'hard', questionText: 'What is the time complexity of a nested loop with n and m iterations?', options: ['O(n)', 'O(n+m)', 'O(n*m)', 'O(log n)'], correctAnswer: 'O(n*m)' },
  { topic: 'recursion', difficulty: 'easy', questionText: 'What is the base case typically used for factorial(n)?', options: ['n==0', 'n==1', 'n<=1', 'n<0'], correctAnswer: 'n<=1' },
  { topic: 'recursion', difficulty: 'easy', questionText: 'Recursion uses which data structure internally?', options: ['Array', 'Stack', 'Queue', 'Heap'], correctAnswer: 'Stack' },
  { topic: 'recursion', difficulty: 'medium', questionText: 'In recursion, what prevents infinite recursion?', options: ['Loop', 'Base case', 'Return type', 'Parameters'], correctAnswer: 'Base case' },
  { topic: 'recursion', difficulty: 'hard', questionText: 'What is the space complexity of a recursive factorial with n calls?', options: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], correctAnswer: 'O(n)' },
  { topic: 'arrays', difficulty: 'easy', questionText: 'What is the index of the first element in an array?', options: ['1', '0', '-1', 'first'], correctAnswer: '0' },
  { topic: 'arrays', difficulty: 'easy', questionText: 'Which method adds an element at the end of an array?', options: ['push', 'pop', 'shift', 'unshift'], correctAnswer: 'push' },
  { topic: 'arrays', difficulty: 'medium', questionText: 'What does array.slice(1,4) return?', options: ['Elements at index 1,2,3', 'Elements at index 1,2,3,4', 'First 4 elements', 'Last 4 elements'], correctAnswer: 'Elements at index 1,2,3' },
  { topic: 'arrays', difficulty: 'hard', questionText: 'Best time complexity to find an element in an unsorted array?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correctAnswer: 'O(n)' },
  { topic: 'dp', difficulty: 'easy', questionText: 'Dynamic Programming is mainly used to optimize what?', options: ['Time', 'Space', 'Both time and space', 'Code length'], correctAnswer: 'Both time and space' },
  { topic: 'dp', difficulty: 'medium', questionText: 'What technique does DP use to avoid recomputation?', options: ['Loop', 'Memoization', 'Recursion only', 'Sorting'], correctAnswer: 'Memoization' },
  { topic: 'dp', difficulty: 'hard', questionText: 'Fibonacci using DP has time complexity:', options: ['O(2^n)', 'O(n)', 'O(n^2)', 'O(log n)'], correctAnswer: 'O(n)' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnsphere_db');
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log('✅ Seeded', questions.length, 'questions');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
