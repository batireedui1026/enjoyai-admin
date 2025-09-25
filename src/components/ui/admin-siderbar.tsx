"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Wallet, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";

interface ProfileSidebarProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export function AdminSidebar({
  userName = "Admin",
  userAvatar = "/placeholder.svg?height=40&width=40",
}: ProfileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const auth = {
    user: { username: userName },
    logout: () => router.push("/login"),
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    {
      id: "dashboard",
      label: "Хяналтын самбар",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      id: "payment",
      label: "Сурагчдийн мэдээлэл",
      icon: Wallet,
      href: "/payment",
    },
  ];

  const getActiveItem = () => {
    if (pathname === "/admin") return "dashboard";
    if (pathname.includes("/admin/province")) return "province";
    if (pathname.includes("/admin/teachers")) return "teachers";
    if (pathname.includes("/admin/program")) return "program";
    if (pathname.includes("/admin/classess")) return "classess";
    if (pathname.includes("/admin/students")) return "students";
    if (pathname.includes("/admin/checklist")) return "checklist";
    if (pathname.includes("/admin/Hub")) return "hub";
    if (pathname.includes("/admin/payment")) return "payment";
    return "";
  };

  const activeItem = getActiveItem();

  const handleLogout = () => {
    auth.logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <SidebarProvider>
      <Sidebar
        variant="sidebar"
        className="border-r border-border bg-card h-screen transition-all duration-300 hidden md:block"
      >
        <SidebarHeader className="border-b border-border p-0">
          <div
            className="flex items-center gap-3 px-4 py-5 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => router.push("/admin")}
          >
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage
                src={userAvatar}
                alt={auth.user?.username || userName}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {(auth.user?.username || userName).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">
                {auth.user?.username || userName}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.username}
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
              Үндсэн цэс
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeItem === item.id}
                      tooltip={item.label}
                      className={cn(
                        "px-3 py-2 rounded-md transition-colors",
                        activeItem === item.id
                          ? "text-black bg-accent"
                          : "hover:text-black hover:bg-accent/50"
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3"
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5",
                            activeItem === item.id
                              ? "text-black"
                              : "text-muted-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            "font-medium",
                            activeItem === item.id
                              ? "text-black"
                              : "text-muted-foreground"
                          )}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator className="my-4" />
        </SidebarContent>
        <SidebarFooter className="border-t border-border mt-auto">
          <SidebarMenu className="p-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={"Гарах"}
                className="px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Гарах</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="md:hidden absolute top-4 right-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md hover:bg-accent/50 transition-colors"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="h-8 w-8 text-black" />
          ) : (
            <Menu className="h-8 w-8 text-black" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            className={cn(
              "md:hidden fixed top-0 left-0 z-50 bg-card w-3/4 max-w-xs h-full border-r border-border transition-transform duration-300",
              isMobileMenuOpen
                ? "transform translate-x-0"
                : "transform -translate-x-full"
            )}
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            <SidebarContent className="px-2 py-4 h-full flex flex-col">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={activeItem === item.id}
                          tooltip={item.label}
                          className={cn(
                            "px-3 py-2 rounded-md transition-colors",
                            activeItem === item.id
                              ? "text-black bg-accent"
                              : "hover:text-black hover:bg-accent/50"
                          )}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-3"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon
                              className={cn(
                                "h-5 w-5",
                                activeItem === item.id
                                  ? "text-black"
                                  : "text-muted-foreground"
                              )}
                            />
                            <span
                              className={cn(
                                "font-medium",
                                activeItem === item.id
                                  ? "text-black"
                                  : "text-muted-foreground"
                              )}
                            >
                              {item.label}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarSeparator className="my-4" />
              <SidebarFooter className="border-t border-border mt-auto">
                <SidebarMenu className="p-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip={"Гарах"}
                      className="px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Гарах</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </SidebarContent>
          </div>
        </>
      )}
    </SidebarProvider>
  );
}
