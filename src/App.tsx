import { DollarSign } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Switch } from "wouter";

import { MainErrorFallback } from "@/components/error/main-error";
import { AppLayout } from "@/components/layout/main-layout";
import { ThemeProvider } from "@/components/theme/provider";
import { SITE_PAGES } from "@/configs/routes";
import { LoginPage } from "@/pages/login";
import { SignupPage } from "@/pages/signup";
import TaskCreationPage from "@/pages/task-creation";
import TaskViewPage from "@/pages/task-view";
import TasksPage from "@/pages/tasks";

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable="touch"
        pauseOnHover
        theme="colored"
      />
      <ThemeProvider storageKey="vite-ui-theme">
        <AppLayout>
          <Switch>
            <Route path={SITE_PAGES.HOME}>
              <DollarSign className="animate-ping fixed left-1/3 top-1/3 size-32" />
              <DollarSign className="animate-ping fixed left-1/4 top-1/4 size-16" />
              <DollarSign className="animate-ping fixed right-1/4 top-2/3 size-20" />
              <DollarSign className="animate-ping fixed left-1/4 top-3/4 size-12" />
              <DollarSign className="animate-ping fixed left-1/2 top-2/3 size-4" />
              <DollarSign className="animate-ping fixed left-2/3 top-1/3 size-8" />
            </Route>
            <Route path={SITE_PAGES.SIGNUP}>
              <SignupPage />
            </Route>
            <Route path={SITE_PAGES.LOGIN}>
              <LoginPage />
            </Route>
            <Route path={SITE_PAGES.TASKS}>
              <TasksPage />
            </Route>
            <Route path={SITE_PAGES.CREATE_TASK}>
              <TaskCreationPage />
            </Route>
            <Route path={SITE_PAGES.VIEW_TASK}>
              <TaskViewPage />
            </Route>
            <Route>
              <h1 className="fixed left-1/2 top-1/4">404, Not Found!</h1>
            </Route>
          </Switch>
        </AppLayout>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
