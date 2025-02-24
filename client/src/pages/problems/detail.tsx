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
import { PlayIcon, LoaderIcon } from 'lucide-react';

export default function ProblemDetail() {
  const { id } = useParams();
  const [language, setLanguage] = useState('python');
  const [input, setInput] = useState('');
  const editorRef = useRef(null);

  const { data: problem, isLoading } = useQuery({
    queryKey: [`/api/problems/${id}`]
  });

  const executeMutation = useMutation({
    mutationFn: async (variables: { code: string; language: string; input: string }) => {
      const res = await apiRequest('POST', '/api/execute', variables);
      return res.json();
    }
  });

  const handleExecute = () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    executeMutation.mutate({ code, language, input });
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
        <h1 className="text-3xl font-bold">{problem?.title}</h1>
        <Badge variant={problem?.difficulty === 'Easy' ? 'default' : 
                       problem?.difficulty === 'Medium' ? 'warning' : 'destructive'}>
          {problem?.difficulty}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <div className="prose dark:prose-invert" 
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
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap">
                  {executeMutation.data.stdout || executeMutation.data.stderr}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
