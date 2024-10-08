import { Fragment, ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CircleUser, Menu, House, Search } from "lucide-react";
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
import { ModeToggle } from "@/components/theme/toggle";
import { SitePages } from "@/configs/routes";
import { getUserSession, logout } from "@/lib/supabase";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";

interface AppLayoutProps {
  children: ReactNode;
}
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AccountDropdown />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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
        <Link href={SitePages.HOME} className={primary}>
          <House
            className={`h-6 w-6 hover:stroke-[3px] ${location === SitePages.HOME.toString() ? "stroke-[3px]" : "stroke-[1.5px]"}`}
          />
          <span className="sr-only">This APP</span>
        </Link>
      </SheetCloseWrapper>
      <SheetCloseWrapper {...shetCloseWrapperProps}>
        <Link
          href={SitePages.TASKS_COMMUNITY}
          className={`${secondary} ${location === SitePages.TASKS_COMMUNITY.toString() ? "text-foreground" : "text-muted-foreground"}`}
        >
          Asks
        </Link>
      </SheetCloseWrapper>
      <SheetCloseWrapper {...shetCloseWrapperProps}>
        <Link
          href={SitePages.TASKS_PERSONAL}
          className={`${secondary} ${location === SitePages.TASKS_PERSONAL.toString() ? "text-foreground" : "text-muted-foreground"}`}
        >
          Tasks
        </Link>
      </SheetCloseWrapper>
      <SheetCloseWrapper {...shetCloseWrapperProps}>
        <Link
          href={SitePages.USERS}
          className={`${secondary} ${location === SitePages.USERS.toString() ? "text-foreground" : "text-muted-foreground"}`}
        >
          Users
        </Link>
      </SheetCloseWrapper>
    </>
  );
}

function AccountDropdown() {
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );

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
  }, []);

  async function handleLogout() {
    try {
      await logout();
      notifySuccess("Successfully Logged Out");
      setLocation(SitePages.HOME);
    } catch (err) {
      handleError(err, "Logout Failed");
    }
  }

  return isAuthenticated ? (
    <>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem>Support</DropdownMenuItem>
      <DropdownMenuSeparator />
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
    </>
  ) : (
    <>
      <DropdownMenuItem>
        <Link href={SitePages.LOGIN}>Login</Link>
      </DropdownMenuItem>
    </>
  );
}
