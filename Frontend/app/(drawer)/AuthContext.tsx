import { createContext, useContext, useState } from "react";

interface AuthContextProps {
  resetKey: number;
  resetApp: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  resetKey: 0,
  resetApp: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [resetKey, setResetKey] = useState(0);

  const resetApp = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <AuthContext.Provider value={{ resetKey, resetApp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
