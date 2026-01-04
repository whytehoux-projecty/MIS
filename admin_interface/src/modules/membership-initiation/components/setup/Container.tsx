import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  currentPage?: string;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  currentPage,
  className = "",
}) => {
  return (
    <div className={cn("min-h-screen bg-muted/30", className)}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Space
            </h1>
            {currentPage && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentPage}
                </span>
              </>
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground">Whyte Houx</span>
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};
