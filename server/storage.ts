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

export class MongoStorage implements IStorage {
  constructor() {
    mongoose.connect(process.env.MONGODB_URL || 'mongodb+srv://taurtk:Neha321@cluster0.hbfko.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => console.error('MongoDB connection error:', err));
  }

  async getProblems(): Promise<Problem[]> {
    try {
      const problems = await ProblemModel.find().lean();
      console.log('Found problems:', problems[0]); // Log first problem to verify data
      return problems.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        acceptance_rate: p.acceptance_rate || null,
        solution_link: p.solution_link || null,
        companies: p.companies || [],
        related_topics: p.related_topics || []
      }));
    } catch (error) {
      console.error('Error fetching problems:', error);
      throw error;
    }
  }

  async getProblem(id: number): Promise<Problem | null> {
    try {
      const problem = await ProblemModel.findOne({ id }).lean();
      if (!problem) return null;

      return {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        acceptance_rate: problem.acceptance_rate || null,
        solution_link: problem.solution_link || null,
        companies: problem.companies || [],
        related_topics: problem.related_topics || []
      };
    } catch (error) {
      console.error('Error fetching problem:', error);
      throw error;
    }
  }
}

export const storage = new MongoStorage();