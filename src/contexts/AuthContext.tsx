import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { UsuarioDTO } from "../types/UsuarioDTO";

interface AuthContextType {
  userData: UsuarioDTO | null;
  setUserData: (userData: UsuarioDTO | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userData, setUserData] = useState<UsuarioDTO | null>(null);

  return (
    <AuthContext.Provider value={{ userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}