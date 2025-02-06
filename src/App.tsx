import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
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
import UpdatePasswordPage from "@/pages/auth/update-password";
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
            <Route path={SITE_PAGES.AUTH.UPDATE_PASSWORD}>
              <UpdatePasswordPage />
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
            <Route path={"/alpha"}>
              <AlphaPdf />
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

function AlphaPdf() {
  const [numPages, setNumPages] = useState<number>();
  const [containerWidth, setContainerWidth] = useState<number>(
    Math.min(0.95 * window.innerWidth, 1200),
  );

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useEffect(() => {
    function handleResize() {
      setContainerWidth(Math.min(0.95 * window.innerWidth, 1200));
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <Document file="/welcome.pdf" onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (_el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={containerWidth}
          />
        ))}
      </Document>
    </div>
  );
}
