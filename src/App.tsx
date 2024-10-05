import { Route, Switch } from "wouter";
import { DollarSign } from "lucide-react";

import { TaskPage } from "@/pages/TaskPage";
import { SignupPage } from "@/pages/SignupPage";
import { LoginPage } from "@/pages/LoginPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/theme/provider";
import { SitePages } from "@/configs/routes";

export default function App() {
  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <AppLayout>
        <Switch>
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
          <Route>
            <h1 className="fixed left-1/2 top-1/4">404, Not Found!</h1>
          </Route>
        </Switch>
      </AppLayout>
    </ThemeProvider>
  );
}
