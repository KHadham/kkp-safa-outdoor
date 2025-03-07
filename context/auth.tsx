import { useStorageState } from "@/hooks/useStorageState";
import {
  useContext,
  createContext,
  type PropsWithChildren,
  useState,
  useEffect,
} from "react";
import { Appearance } from "react-native";

type Theme = "light" | "dark";
const Session = {
  user_id: 20704,
  username: "puguh",
  email: "puguhtp@pbasolusi.com",
  full_name: "Puguh Try Pamungkas",
  group_codes: "PMO",
};

type Session = {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  group_codes: string;
};

const AuthContext = createContext<{
  signIn: (txt: string) => void;
  signOut: () => void;
  token?: string | null;
  setSession?: () => void;
  session?: Session | null;
  isLoading: boolean;
  theme: Theme;
  toggleTheme: () => void;
}>({
  signIn: () => null,
  signOut: () => null,
  token: null,
  setSession: () => null,
  session: null,
  isLoading: false,
  theme: "light",
  toggleTheme: () => null,
});

// This hook can be used to access the auth and theme info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoadingToken, token], setToken] = useStorageState("token");
  const [[isLoadingSession, session], setSession] = useStorageState("session");

  // State to simulate loading process
  const [isLoading, setIsLoading] = useState(true);

  // State for theme management
  const [theme, setTheme] = useState<Theme>(
    Appearance.getColorScheme() === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    setIsLoading(true); // Set loading to true when component mounts
    const timer = setTimeout(() => {
      setIsLoading(false); // Simulate completion after 2 seconds
    }, 2000);

    return () => clearTimeout(timer); // Clean up the timeout on component unmount
  }, []);

  useEffect(() => {
    // Automatically update theme based on system preference
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === "dark" ? "dark" : "light");
    });

    return () => listener.remove(); // Clean up listener on unmount
  }, []);

  // Method to toggle theme manually
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <AuthContext.Provider
      value={{
        setSession: () => {
          setIsLoading(true); // Start loading
          setTimeout(() => {
            setSession(Session); // Simulate session setting after 1 second
            setIsLoading(false); // Finish loading
          }, 2000);
        },
        signIn: (user) => {
          setIsLoading(true); // Start loading
          setTimeout(() => {
            setToken(user); // Simulate session setting after 1 second
            setIsLoading(false); // Finish loading
          }, 2000);
        },
        signOut: () => {
          setIsLoading(true); // Start loading
          setTimeout(() => {
            setToken(null); // Simulate session removal after 1 second
            setIsLoading(false); // Finish loading
          }, 2000);
        },
        token,
        session,
        isLoading,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
