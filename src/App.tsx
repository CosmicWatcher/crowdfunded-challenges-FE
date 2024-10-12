import { Route, Switch } from "wouter";
import { DollarSign } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { TaskPage } from "@/pages/TaskPage";
import { SignupPage } from "@/pages/signup";
import { LoginPage } from "@/pages/login";
import { AppLayout } from "@/components/layout/main-layout";
import { ThemeProvider } from "@/components/theme/provider";
import { SITE_PAGES } from "@/configs/routes";
import { MainErrorFallback } from "@/components/error/main";

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
              <TaskPage />
            </Route>
            <Route path={SitePages.TASKS_PERSONAL}>
              <TaskPage />
            </Route>
            <Route path={SitePages.USERS}>
              <h1>USERS PAGE</h1>
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
