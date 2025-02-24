import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search, Code2, Filter } from 'lucide-react';
import type { Problem } from '@shared/schema';

const ITEMS_PER_PAGE = 10;

export default function ProblemList() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ['/api/problems']
  });

  const filteredProblems = problems?.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase()) ||
                         problem.description.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficulty === 'all' || problem.difficulty === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  const totalPages = Math.ceil((filteredProblems?.length || 0) / ITEMS_PER_PAGE);
  const currentPageProblems = filteredProblems?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary/5 border-b">
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <Code2 className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-primary">CodeAron</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Master coding challenges with our curated collection of programming problems. 
            Practice, learn, and improve your skills with real-time code execution and detailed feedback.
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-8 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Problems List */}
        <div className="space-y-4 mb-8">
          {currentPageProblems?.map((problem) => (
            <Link key={problem.id} href={`/problems/${problem.id}`}>
              <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{problem.title}</h2>
                    <Badge variant={
                      problem.difficulty === 'Easy' ? 'default' : 
                      problem.difficulty === 'Medium' ? 'secondary' : 
                      'destructive'
                    }>
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredProblems?.length || 0)} of {filteredProblems?.length || 0} problems
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}