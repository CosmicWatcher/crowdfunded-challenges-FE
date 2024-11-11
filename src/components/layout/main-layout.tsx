import { CircleUser, House, Menu, Search } from "lucide-react";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

import { ModeToggle } from "@/components/theme/toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { NO_USERNAME } from "@/configs/constants";

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
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <ModeToggle />
          <AccountDropdown />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 px-1 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}

interface NavSectionProps {
  isInSheet?: boolean;
}
function NavSection({ isInSheet = false }: NavSectionProps) {
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
          <House
            className={`h-6 w-6 hover:stroke-[3px] ${location === SITE_PAGES.HOME.toString() ? "stroke-[3px]" : "stroke-[1.5px]"}`}
          />
          <span className="sr-only">This APP</span>
        </Link>
      </SheetCloseWrapper>
      <SheetCloseWrapper {...shetCloseWrapperProps}>
        <Link
          href={SITE_PAGES.TASKS}
          className={`${secondary} ${location === SITE_PAGES.TASKS.toString() ? "text-foreground" : "text-muted-foreground"}`}
        >
          View
        </Link>
      </SheetCloseWrapper>
      <SheetCloseWrapper {...shetCloseWrapperProps}>
        <Link
          href={SITE_PAGES.CREATE_TASK}
          className={`${secondary} ${location === SITE_PAGES.TASKS.toString() ? "text-foreground" : "text-muted-foreground"}`}
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
  const [username, setUsername] = useState<string>(NO_USERNAME);

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getUserSession();
        if (!session) setAuthenticated(false);
        else {
          setUsername(session.user.email ?? NO_USERNAME);
          setAuthenticated(true);
        }
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
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem>Support</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => void handleLogout()}>
        Logout
      </DropdownMenuItem>
    </>
  ) : (
    <>
      <DropdownMenuItem>
        <Link href={SITE_PAGES.LOGIN}>Login</Link>
      </DropdownMenuItem>
    </>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          {isAuthenticated ? (
            <Avatar>
              <AvatarFallback>
                {`${username[0].toUpperCase()}${username[1].toUpperCase()}`}
              </AvatarFallback>
            </Avatar>
          ) : (
            <CircleUser className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{content}</DropdownMenuContent>
    </DropdownMenu>
  );
}
