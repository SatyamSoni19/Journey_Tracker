import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { authApi, type SafeUser } from "@/lib/api";

interface AuthContextValue {
    user: SafeUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<SafeUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On first load, ask the backend "am I already logged in?" using the httpOnly cookie.
    useEffect(() => {
        let cancelled = false;

        async function restoreSession() {
            try {
                const result = await authApi.getCurrentUser();
                if (!cancelled) {
                    setUser(result.user);
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void restoreSession();

        return () => {
            cancelled = true;
        };
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const result = await authApi.login({ email, password });
        setUser(result.user);
    }, []);

    const register = useCallback(
        async (name: string, email: string, password: string) => {
            await authApi.register({ name, email, password });
            // Registration doesn't issue tokens — log in right after for a smooth flow.
            const result = await authApi.login({ email, password });
            setUser(result.user);
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            // Clear local state regardless of whether the server call succeeded —
            // if the cookie was already invalid, there's nothing left to "log out" of.
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: user !== null,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}