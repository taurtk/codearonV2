import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import mongoose from 'mongoose';

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

async function importProblems() {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb+srv://taurtk:Neha321@cluster0.hbfko.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Clear existing problems
    await ProblemModel.deleteMany({});
    console.log('Cleared existing problems');

    const csvFilePath = path.join(process.cwd(), 'attached_assets', 'leetcode_dataset - lc.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    const records = await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    // Log the first record to see the structure
    console.log('Sample record:', records[0]);

    const problems = (records as any[]).map((record, index) => ({
      id: index + 1,
      title: record.Title || 'Unknown Problem',
      description: record.Description || 'No description available',
      difficulty: record.Difficulty || 'Medium',
      acceptance_rate: record['Acceptance Rate'] || null,
      solution_link: record['Solution Link'] || null,
      companies: record.Companies ? record.Companies.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
      related_topics: record.Topics ? record.Topics.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    }));

    // Log a sample problem to verify the transformation
    console.log('Sample transformed problem:', problems[0]);

    await ProblemModel.insertMany(problems);
    console.log(`Imported ${problems.length} problems successfully`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importProblems();