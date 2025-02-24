import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlayIcon, LoaderIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { editorOptions } from '@/lib/monaco';

interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

interface ExecutionResult {
  status: { id: number; description: string };
  stdout: string;
  stderr: string;
  compile_output: string;
  message: string;
  time: string;
  memory: string;
}

export default function ProblemDetail() {
  const { id } = useParams();
  const [language, setLanguage] = useState('python');
  const [input, setInput] = useState('');
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  const { data: problem, isLoading } = useQuery({
    queryKey: [`/api/problems/${id}`]
  });

  const executeMutation = useMutation({
    mutationFn: async (variables: { code: string; language: string; input: string; problemId: number }) => {
      const res = await apiRequest('POST', '/api/execute', variables);
      return res.json() as Promise<ExecutionResult>;
    }
  });

  const handleExecute = () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();

    toast({
      title: "Executing code...",
      description: "Please wait while we process your submission"
    });

    executeMutation.mutate({ 
      code, 
      language, 
      input,
      problemId: Number(id)
    });
  };

  const renderTestResults = (stdout: string) => {
    try {
      const results = JSON.parse(stdout) as TestCaseResult[];
      return (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Test Case {index + 1}</span>
                {result.passed ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="font-medium">Input:</span> {result.input}
                </div>
                <div>
                  <span className="font-medium">Expected:</span> {result.expectedOutput}
                </div>
                <div>
                  <span className="font-medium">Your Output:</span> {result.actualOutput}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } catch {
      // If stdout is not JSON, display it normally
      return (
        <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md">
          {stdout}
        </pre>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-primary">CodeAron</h1>
        <h2 className="text-2xl">{problem?.title}</h2>
        <Badge variant={
          problem?.difficulty === 'Easy' ? 'default' : 
          problem?.difficulty === 'Medium' ? 'secondary' : 
          'destructive'
        }>
          {problem?.difficulty}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <div className="prose dark:prose-invert max-w-none" 
                 dangerouslySetInnerHTML={{ __html: problem?.description }} />

            {problem?.companies && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Companies</h3>
                <div className="flex gap-2 flex-wrap">
                  {problem.companies.map(company => (
                    <Badge key={company} variant="outline">{company}</Badge>
                  ))}
                </div>
              </div>
            )}

            {problem?.related_topics && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Topics</h3>
                <div className="flex gap-2 flex-wrap">
                  {problem.related_topics.map(topic => (
                    <Badge key={topic} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExecute} disabled={executeMutation.isPending}>
              {executeMutation.isPending ? (
                <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <PlayIcon className="w-4 h-4 mr-2" />
              )}
              Run Code
            </Button>
          </div>

          <div className="h-[400px] border rounded-md overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={language}
              theme="vs-dark"
              options={editorOptions}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>

          <Textarea 
            placeholder="Custom input..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {executeMutation.data && (
            <Alert variant={executeMutation.data.status?.id === 3 ? "default" : "destructive"}>
              <div className="flex items-start gap-2">
                {executeMutation.data.status?.id === 3 ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
                <AlertDescription>
                  <div className="font-medium mb-2">
                    Status: {executeMutation.data.status?.description}
                    {executeMutation.data.time && ` (${executeMutation.data.time}s, ${executeMutation.data.memory}KB)`}
                  </div>
                  {executeMutation.data.stdout && renderTestResults(executeMutation.data.stdout)}
                  {executeMutation.data.stderr && (
                    <pre className="whitespace-pre-wrap bg-destructive/10 text-destructive p-4 rounded-md mt-2">
                      {executeMutation.data.stderr}
                    </pre>
                  )}
                  {executeMutation.data.compile_output && (
                    <pre className="whitespace-pre-wrap bg-warning/10 text-warning p-4 rounded-md mt-2">
                      {executeMutation.data.compile_output}
                    </pre>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}