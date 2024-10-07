import { ReactNode, useEffect, useState } from "react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
          <Link
            href={SitePages.HOME}
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <House className="h-6 w-6" />
            <span className="sr-only">This APP</span>
          </Link>
          <Link
            href={SitePages.TASK}
            className="text-foreground transition-colors hover:text-foreground"
          >
            Tasks
          </Link>
          <Link
            href={SitePages.SIGNUP}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            SignUp
          </Link>
          <Link
            href={SitePages.LOGIN}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Login
          </Link>
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
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href={SitePages.HOME}
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <House className="h-6 w-6" />
                <span className="sr-only">This APP</span>
              </Link>
              <Link href={SitePages.TASK} className="hover:text-foreground">
                Tasks
              </Link>
              <Link
                href={SitePages.SIGNUP}
                className="text-muted-foreground hover:text-foreground"
              >
                SignUp
              </Link>
              <Link
                href={SitePages.LOGIN}
                className="text-muted-foreground hover:text-foreground"
              >
                Login
              </Link>
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
