import { CircleUser, Menu, Search, UserCog } from "lucide-react";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { createNoise2D } from "simplex-noise";
import { Link, useLocation } from "wouter";

import { ModeToggle } from "@/components/theme/toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SITE_PAGES } from "@/configs/routes";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { getUserSession, logout } from "@/lib/supabase";

import logo from "/logo.png";

interface AppLayoutProps {
  children: ReactNode;
}
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <NavSection />
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-1/2">
            <nav className="grid gap-6 text-lg font-medium">
              <NavSection isInSheet />
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
          {/* <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form> */}
          <ModeToggle />
          <AccountDropdown />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 px-1 md:gap-8 md:p-8">
        <BackgroundCanvas />
        {children}
      </main>
    </div>
  );
}

function NavSection({ isInSheet = false }: { isInSheet?: boolean }) {
  const [location, _setLocation] = useLocation();
  const [SheetCloseWrapper, shetCloseWrapperProps] = isInSheet
    ? [SheetClose, { asChild: true }]
    : [Fragment, {}]; // delegate SheetClose behavior to its child if isInSheet == true, otherwise use <>

  const primary = `flex items-center gap-2 text-xl font-semibold ${isInSheet ? "" : "md:text-base"}`;
  const secondary = `hover:text-foreground text-lg ${isInSheet ? "" : "transition-colors"}`;

  return (
    <>
      <SheetCloseWrapper {...shetCloseWrapperProps}>
        <Link href={SITE_PAGES.HOME} className={primary}>
          <img src={logo} alt="KinQuest" className="size-[40px]" />
          <span
            className={`text-xl mr-10 ${location === SITE_PAGES.HOME.toString() ? "text-foreground" : "text-muted-foreground"}`}
          >
            KinQuest
          </span>
        </Link>
      </SheetCloseWrapper>
      <SheetCloseWrapper {...shetCloseWrapperProps}>
        <Link
          href={SITE_PAGES.TASKS.LIST}
          className={`${secondary} ${location === SITE_PAGES.TASKS.LIST.toString() ? "text-foreground" : "text-muted-foreground"}`}
        >
          View
        </Link>
      </SheetCloseWrapper>
      <SheetCloseWrapper {...shetCloseWrapperProps}>
        <Link
          href={SITE_PAGES.TASKS.CREATE}
          className={`${secondary} ${location === SITE_PAGES.TASKS.CREATE.toString() ? "text-foreground" : "text-muted-foreground"}`}
        >
          Create
        </Link>
      </SheetCloseWrapper>
    </>
  );
}

function AccountDropdown() {
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getUserSession();
        if (!session) setAuthenticated(false);
        else setAuthenticated(true);
      } catch (err) {
        handleError(err);
      }
    }
    void checkAuth();
  });

  async function handleLogout() {
    try {
      await logout();
      notifySuccess("Successfully Logged Out");
      setAuthenticated(false);
      setLocation(SITE_PAGES.HOME);
    } catch (err) {
      handleError(err, "Logout Failed");
    }
  }

  const content = isAuthenticated ? (
    <>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => setLocation(SITE_PAGES.ACCOUNT)}
      >
        My Account
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => void handleLogout()}
      >
        Logout
      </DropdownMenuItem>
    </>
  ) : (
    <DropdownMenuItem
      className="cursor-pointer"
      onClick={() => {
        sessionStorage.setItem("previousLocation", window.location.pathname);
        setLocation(SITE_PAGES.AUTH.LOGIN);
      }}
    >
      Login
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={`rounded-full shadow-md ${
            isAuthenticated ? "bg-primary" : ""
          }`}
        >
          {isAuthenticated ? (
            <UserCog className="size-6" />
          ) : (
            <CircleUser className="size-8" />
          )}
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{content}</DropdownMenuContent>
    </DropdownMenu>
  );
}

const noise2D = createNoise2D();

function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["rgb(0 77 179)", "rgb(116 80 62)", "rgb(109 40 217)"];
    let frame = 0;

    const animate = () => {
      frame++;
      ctx.fillStyle = "rgba(0,0,0,0.01)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < colors.length; i++) {
        // const noiseX = Math.sin(frame * 0.05 + i * 2.1) * 0.3;
        // const noiseY = Math.cos(frame * 0.07 + i * 1.7) * 0.3;
        const noiseX = noise2D(frame * 0.05 + i * 2.1, frame * 0.05 + i * 2.1);
        const noiseY = noise2D(frame * 0.07 + i * 1.7, frame * 0.07 + i * 1.7);

        const x =
          (Math.sin(frame * 0.1 + i + noiseX) * canvas.width) / 2 +
          canvas.width / 2 +
          Math.sin(frame * 0.03 + i * 3.2) * 100;

        const y =
          (Math.cos(frame * 0.15 + i + noiseY) * canvas.height) / 2 +
          canvas.height / 2 +
          Math.cos(frame * 0.04 + i * 2.8) * 100;

        const size = Math.abs(
          noise2D(frame * 0.01 + i * 0.5, frame * 0.02 + i * 0.3) * 20 + 1,
        );

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = 0.1;
        ctx.fill();
      }

      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 1000 / 30);
    };

    animate();

    function handleResize() {
      if (!canvas) return;
      if (
        Math.abs(window.innerWidth - canvas.width) < 0.1 * canvas.width &&
        Math.abs(window.innerHeight - canvas.height) < 0.1 * canvas.height
      )
        return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
}
