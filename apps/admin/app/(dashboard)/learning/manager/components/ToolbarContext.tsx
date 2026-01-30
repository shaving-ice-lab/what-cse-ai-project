"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ToolbarContextType {
  toolbarContent: ReactNode;
  setToolbarContent: (content: ReactNode) => void;
}

const ToolbarContext = createContext<ToolbarContextType | null>(null);

export function ToolbarProvider({ children }: { children: ReactNode }) {
  const [toolbarContent, setToolbarContent] = useState<ReactNode>(null);

  return (
    <ToolbarContext.Provider value={{ toolbarContent, setToolbarContent }}>
      {children}
    </ToolbarContext.Provider>
  );
}

export function useToolbar() {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error("useToolbar must be used within a ToolbarProvider");
  }
  return context;
}

// Hook for components to register their toolbar
export function useRegisterToolbar(content: ReactNode) {
  const { setToolbarContent } = useToolbar();
  
  // Register on mount, clear on unmount
  const register = useCallback(() => {
    setToolbarContent(content);
    return () => setToolbarContent(null);
  }, [content, setToolbarContent]);

  return register;
}
