import mongoose from 'mongoose';
import { Problem } from '@shared/schema';

export interface IStorage {
  getProblems(): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | null>;
}

// MongoDB Problem Schema
const ProblemSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  difficulty: String,
  acceptance_rate: String,
  solution_link: String,
  companies: [String],
  related_topics: [String]
});

const ProblemModel = mongoose.model('Problem', ProblemSchema);

export class MongoStorage implements IStorage {
  constructor() {
    mongoose.connect(process.env.MONGODB_URL || 'mongodb+srv://taurtk:Neha321@cluster0.hbfko.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  }

  async getProblems(): Promise<Problem[]> {
    const problems = await ProblemModel.find().lean();
    return problems.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      acceptance_rate: p.acceptance_rate,
      solution_link: p.solution_link,
      companies: p.companies,
      related_topics: p.related_topics
    }));
  }

  async getProblem(id: number): Promise<Problem | null> {
    const problem = await ProblemModel.findOne({ id }).lean();
    if (!problem) return null;
    
    return {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      acceptance_rate: problem.acceptance_rate,
      solution_link: problem.solution_link,
      companies: problem.companies,
      related_topics: problem.related_topics
    };
  }
}

export const storage = new MongoStorage();
