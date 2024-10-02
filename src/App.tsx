import { Route } from "wouter";
import { DollarSign } from "lucide-react";

import { TaskPage } from "@/TaskPage";
import { SignupPage, LoginPage } from "@/AuthPages";
import { Dashboard } from "@/Dashboard";
import { ThemeProvider } from "@/components/theme-provider";
import { SitePages } from "@/config";

export default function App() {
  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <Dashboard>
        <Route path={SitePages.HOME}>
          <DollarSign className="animate-ping fixed left-1/3 top-1/3 size-32" />
          <DollarSign className="animate-ping fixed left-1/4 top-1/4 size-16" />
          <DollarSign className="animate-ping fixed right-1/4 top-2/3 size-20" />
          <DollarSign className="animate-ping fixed left-1/4 top-3/4 size-12" />
          <DollarSign className="animate-ping fixed left-1/2 top-2/3 size-4" />
          <DollarSign className="animate-ping fixed left-2/3 top-1/3 size-8" />
        </Route>
        <Route path={SitePages.SIGNUP}>
          <SignupPage />
        </Route>
        <Route path={SitePages.LOGIN}>
          <LoginPage />
        </Route>
        <Route path={SitePages.TASK}>
          <TaskPage />
        </Route>
      </Dashboard>
    </ThemeProvider>
  );
}
