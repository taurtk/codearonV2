import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from 'axios';

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = 'TaKUYaXZrImsh1qNwfJhj1mnisTpp1TuKnSjsnXZ7ftgBBVOP3';

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/problems', async (req, res) => {
    try {
      const problems = await storage.getProblems();
      console.log('Fetched problems:', problems);
      res.json(problems);
    } catch (err) {
      console.error('Error fetching problems:', err);
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
      console.error('Error fetching problem:', err);
      res.status(500).json({ error: 'Failed to fetch problem' });
    }
  });

  app.post('/api/execute', async (req, res) => {
    const { code, language, input } = req.body;

    try {
      // Submit code to Judge0
      const submissionResponse = await axios.post(`${JUDGE0_API}/submissions`, {
        source_code: code,
        language_id: language === 'python' ? 71 : 63, // 71 for Python, 63 for JavaScript
        stdin: input,
        wait: false // Don't wait for execution to complete
      }, {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': JUDGE0_API_KEY
        }
      });

      const token = submissionResponse.data.token;

      // Poll for results
      let result;
      for (let i = 0; i < 10; i++) { // Try up to 10 times
        const response = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
          headers: {
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'X-RapidAPI-Key': JUDGE0_API_KEY
          }
        });

        if (response.data.status?.id > 2) { // Status > 2 means processing is complete
          result = response.data;
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before next poll
      }

      if (!result) {
        throw new Error('Execution timed out');
      }

      res.json({
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        message: result.message,
        time: result.time,
        memory: result.memory
      });
    } catch (err) {
      console.error('Error executing code:', err);
      res.status(500).json({ error: 'Code execution failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}