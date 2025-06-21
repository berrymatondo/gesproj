"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Building2, Users, BarChart3, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/departments",
      label: "Départements",
      icon: Building2,
    },
    {
      href: "/persons",
      label: "Personnes",
      icon: Users,
    },
    {
      href: "/projects",
      label: "Projets",
      icon: FolderOpen,
    },
    {
      href: "/reports",
      label: "Rapports",
      icon: BarChart3,
    },
  ];

  return (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex items-center space-x-2",
                isActive && "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
