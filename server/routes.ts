import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from 'axios';

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/problems', async (req, res) => {
    try {
      const problems = await storage.getProblems();
      res.json(problems);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch problems' });
    }
  });

  app.get('/api/problems/:id', async (req, res) => {
    try {
      const problem = await storage.getProblem(Number(req.params.id));
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json(problem);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch problem' });
    }
  });

  app.post('/api/execute', async (req, res) => {
    const { code, language, input } = req.body;

    try {
      // Submit code to Judge0
      const response = await axios.post(`${JUDGE0_API}/submissions`, {
        source_code: code,
        language_id: language === 'python' ? 71 : 63,
        stdin: input
      }, {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || 'demo-key'
        }
      });

      const token = response.data.token;

      // Get results
      const result = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || 'demo-key'
        }
      });

      res.json(result.data);
    } catch (err) {
      res.status(500).json({ error: 'Code execution failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
