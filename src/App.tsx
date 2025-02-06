import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Switch, useParams } from "wouter";

import { MainErrorFallback } from "@/components/error/main-error";
import { AppLayout } from "@/components/layout/main-layout";
import { ThemeProvider } from "@/components/theme/provider";
import NotFoundAlert from "@/components/ui/not-found";
import { SITE_PAGES } from "@/configs/routes";
import { verifyCodeWalletLogin } from "@/lib/api";
import { LoginPage } from "@/pages/auth/login";
import { SignupPage } from "@/pages/auth/signup";
import VerifyEmailPage from "@/pages/auth/verify-email";
import HomePage from "@/pages/home/home";
import { TaskCreationPage, TaskListPage, TaskViewPage } from "@/pages/task";
import UserAccountPage from "@/pages/user/account";

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <ToastContainer
        position="bottom-right"
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
              <HomePage />
            </Route>
            <Route path={SITE_PAGES.AUTH.SIGNUP}>
              <SignupPage />
            </Route>
            <Route path={SITE_PAGES.AUTH.LOGIN}>
              <LoginPage />
            </Route>
            <Route path={SITE_PAGES.AUTH.VERIFY}>
              <VerifyEmailPage />
            </Route>
            <Route path={SITE_PAGES.TASKS.LIST}>
              <TaskListPage />
            </Route>
            <Route path={SITE_PAGES.TASKS.CREATE}>
              <TaskCreationPage />
            </Route>
            <Route path={SITE_PAGES.TASKS.VIEW}>
              <TaskViewPage />
            </Route>
            <Route path={SITE_PAGES.ACCOUNT}>
              <UserAccountPage />
            </Route>
            <Route path={"/code-wallet/login/success/:id"}>
              <CodeWalletLoginSuccessPage />
            </Route>
            <Route>
              <NotFoundAlert
                title="Page Not Found!"
                description="Please check the URL and try again."
              />
            </Route>
          </Switch>
        </AppLayout>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function CodeWalletLoginSuccessPage() {
  const params = useParams();
  const intentId = params.id;

  useEffect(() => {
    let ignore = false;
    const verifyLogin = async () => {
      if (ignore) return;
      if (intentId) {
        await verifyCodeWalletLogin(intentId);
      }
    };
    void verifyLogin();
    return () => {
      ignore = true;
    };
  }, [intentId]);

  return <div>INTENT_ID: {intentId}</div>;
}
