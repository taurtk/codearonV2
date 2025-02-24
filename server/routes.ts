import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from 'axios';

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = 'TaKUYaXZrImsh1qNwfJhj1mnisTpp1TuKnSjsnXZ7ftgBBVOP3';

interface TestCase {
  input: string;
  expectedOutput: string;
}

// Test cases for different problems
const problemTestCases: Record<number, TestCase[]> = {
  // Two Sum (Problem ID: 1)
  1: [
    {
      input: "nums = [2,7,11,15], target = 9",
      expectedOutput: "[0,1]"
    },
    {
      input: "nums = [3,2,4], target = 6",
      expectedOutput: "[1,2]"
    },
    {
      input: "nums = [3,3], target = 6",
      expectedOutput: "[0,1]"
    }
  ],
  // Reverse Integer (Problem ID: 2)
  2: [
    {
      input: "123",
      expectedOutput: "321"
    },
    {
      input: "-123",
      expectedOutput: "-321"
    },
    {
      input: "120",
      expectedOutput: "21"
    },
    {
      input: "0",
      expectedOutput: "0"
    }
  ],
  // Add more problems here...
};

// Validation functions for different problems
const problemValidators: Record<number, (output: string, expected: string) => boolean> = {
  // Two Sum validator
  1: (output: string, expected: string): boolean => {
    const normalizedOutput = output.trim().replace(/\s+/g, '').toLowerCase();
    const normalizedExpected = expected.trim().replace(/\s+/g, '').toLowerCase();

    if (!normalizedOutput.startsWith('[') || !normalizedOutput.endsWith(']')) {
      return false;
    }

    const outputNums = normalizedOutput.slice(1, -1).split(',').map(Number).sort();
    const expectedNums = normalizedExpected.slice(1, -1).split(',').map(Number).sort();

    return outputNums.length === expectedNums.length && 
           outputNums.every((num, idx) => num === expectedNums[idx]);
  },
  // Reverse Integer validator
  2: (output: string, expected: string): boolean => {
    const normalizedOutput = output.trim().replace(/\s+/g, '');
    const normalizedExpected = expected.trim().replace(/\s+/g, '');
    return normalizedOutput === normalizedExpected;
  },
  // Add more validators here...
};

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
    const { code, language, input, problemId } = req.body;

    try {
      // Check if we have test cases for this problem
      if (problemTestCases[problemId]) {
        let allTestsPassed = true;
        const results = [];

        for (const test of problemTestCases[problemId]) {
          const submissionResponse = await axios.post(`${JUDGE0_API}/submissions`, {
            source_code: code,
            language_id: language === 'python' ? 71 : 63,
            stdin: test.input,
            wait: false
          }, {
            headers: {
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
              'X-RapidAPI-Key': JUDGE0_API_KEY
            }
          });

          const token = submissionResponse.data.token;

          // Poll for results
          let result;
          for (let i = 0; i < 10; i++) {
            const response = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
              headers: {
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key': JUDGE0_API_KEY
              }
            });

            if (response.data.status?.id > 2) {
              result = response.data;
              break;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          if (!result) {
            throw new Error('Execution timed out');
          }

          // If compilation error or runtime error, return immediately
          if (result.status.id !== 3) {
            return res.json(result);
          }

          // Validate output against expected output using the appropriate validator
          const validator = problemValidators[problemId];
          const isCorrect = validator 
            ? validator(result.stdout, test.expectedOutput)
            : result.stdout.trim() === test.expectedOutput.trim();

          if (!isCorrect) {
            allTestsPassed = false;
          }

          results.push({
            input: test.input,
            expectedOutput: test.expectedOutput,
            actualOutput: result.stdout,
            passed: isCorrect
          });
        }

        // Return combined results
        return res.json({
          status: {
            id: allTestsPassed ? 3 : 4,
            description: allTestsPassed ? 'Accepted' : 'Wrong Answer'
          },
          stdout: JSON.stringify(results, null, 2),
          time: '0.0',
          memory: '0'
        });
      }

      // For problems without test cases, just execute normally
      const submissionResponse = await axios.post(`${JUDGE0_API}/submissions`, {
        source_code: code,
        language_id: language === 'python' ? 71 : 63,
        stdin: input,
        wait: false
      }, {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': JUDGE0_API_KEY
        }
      });

      const token = submissionResponse.data.token;

      // Poll for results
      let result;
      for (let i = 0; i < 10; i++) {
        const response = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
          headers: {
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'X-RapidAPI-Key': JUDGE0_API_KEY
          }
        });

        if (response.data.status?.id > 2) {
          result = response.data;
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!result) {
        throw new Error('Execution timed out');
      }

      res.json(result);
    } catch (err) {
      console.error('Error executing code:', err);
      res.status(500).json({ error: 'Code execution failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}