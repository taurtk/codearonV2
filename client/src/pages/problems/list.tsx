import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function ProblemList() {
  const { data: problems, isLoading } = useQuery({
    queryKey: ['/api/problems']
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Coding Problems</h1>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-4">
          {problems?.map((problem) => (
            <Link key={problem.id} href={`/problems/${problem.id}`}>
              <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{problem.title}</h2>
                    <Badge variant={problem.difficulty === 'Easy' ? 'default' : 
                                 problem.difficulty === 'Medium' ? 'warning' : 'destructive'}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span>Acceptance Rate: {problem.acceptance_rate}</span>
                    {problem.companies && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {problem.companies.slice(0,3).map(company => (
                          <Badge key={company} variant="outline">{company}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
