import mongoose from 'mongoose';
import { Problem, problemSchema } from '@shared/schema';

export interface IStorage {
  getProblems(): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | null>;
}

// MongoDB Problem Schema
const ProblemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, required: true },
  acceptance_rate: String,
  solution_link: String,
  companies: [String],
  related_topics: [String]
});

const ProblemModel = mongoose.model('Problem', ProblemSchema);

// Sample problems for testing
const sampleProblems = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    acceptance_rate: "48%",
    companies: ["Amazon", "Google", "Facebook"],
    related_topics: ["Array", "Hash Table"]
  },
  {
    id: 2,
    title: "Add Two Numbers",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit.",
    difficulty: "Medium",
    acceptance_rate: "39%",
    companies: ["Microsoft", "Apple", "Amazon"],
    related_topics: ["Linked List", "Math"]
  }
];

export class MongoStorage implements IStorage {
  constructor() {
    mongoose.connect(process.env.MONGODB_URL || 'mongodb+srv://taurtk:Neha321@cluster0.hbfko.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
      .then(async () => {
        console.log('Connected to MongoDB');
        // Check if we have any problems, if not insert sample problems
        const count = await ProblemModel.countDocuments();
        if (count === 0) {
          await ProblemModel.insertMany(sampleProblems);
          console.log('Inserted sample problems');
        }
      })
      .catch((err) => console.error('MongoDB connection error:', err));
  }

  async getProblems(): Promise<Problem[]> {
    const problems = await ProblemModel.find().lean();
    console.log('Found problems:', problems);
    return problems.map(p => ({
      id: p.id,
      title: p.title || '',
      description: p.description || '',
      difficulty: p.difficulty || '',
      acceptance_rate: p.acceptance_rate || null,
      solution_link: p.solution_link || null,
      companies: p.companies || null,
      related_topics: p.related_topics || null
    }));
  }

  async getProblem(id: number): Promise<Problem | null> {
    const problem = await ProblemModel.findOne({ id }).lean();
    if (!problem) return null;

    return {
      id: problem.id,
      title: problem.title || '',
      description: problem.description || '',
      difficulty: problem.difficulty || '',
      acceptance_rate: problem.acceptance_rate || null,
      solution_link: problem.solution_link || null,
      companies: problem.companies || null,
      related_topics: problem.related_topics || null
    };
  }
}

export const storage = new MongoStorage();