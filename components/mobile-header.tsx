"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MessageSquare,
  Home,
  Bell,
  Grid3X3,
  Download,
  PrinterIcon as Print,
} from "lucide-react";

interface MobileHeaderProps {
  onExportExcel: () => void;
}

export function MobileHeader({ onExportExcel }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">DSI</span>
          </div>
          <span className="text-xl font-semibold text-blue-600">
            SUIVI DE PROJETS
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Grid3X3 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Home className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onExportExcel}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Print className="h-4 w-4" />
          </Button>
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">RT</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              Messages
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Bell className="h-5 w-5 mr-3" />
              Notifications
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Grid3X3 className="h-5 w-5 mr-3" />
              Applications
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5 mr-3" />
              Accueil
            </Button>
            <hr className="my-2" />
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                onExportExcel();
                setIsMenuOpen(false);
              }}
            >
              <Download className="h-5 w-5 mr-3" />
              Exporter Excel
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Print className="h-5 w-5 mr-3" />
              Imprimer
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
