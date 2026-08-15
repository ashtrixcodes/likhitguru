import React, { createContext, ReactNode, useContext, useState } from 'react';

interface SidebarContextType {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
}

const defaultSidebarContext: SidebarContextType = {
  sidebarVisible: false,
  setSidebarVisible: () => {},
};

const SidebarContext = createContext<SidebarContextType>(defaultSidebarContext);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  return context || defaultSidebarContext;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <SidebarContext.Provider value={{ sidebarVisible, setSidebarVisible }}>
      {children}
    </SidebarContext.Provider>
  );
};
