import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ProblemList from "@/pages/problems/list";
import ProblemDetail from "@/pages/problems/detail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProblemList} />
      <Route path="/problems/:id" component={ProblemDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
