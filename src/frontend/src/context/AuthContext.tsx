import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserProfile } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  identity: ReturnType<typeof useInternetIdentity>["identity"];
  userProfile: UserProfile | null;
  profileLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoggingIn: false,
  identity: undefined,
  userProfile: null,
  profileLoading: false,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const refreshProfile = useCallback(async () => {
    if (!actor || isFetching) return;
    setProfileLoading(true);
    try {
      const profile = await actor.getCallerUserProfile();
      setUserProfile(profile);
    } catch {
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    if (isAuthenticated && actor && !isFetching) {
      refreshProfile();
    } else if (!isAuthenticated) {
      setUserProfile(null);
    }
  }, [isAuthenticated, actor, isFetching, refreshProfile]);

  const handleLogin = useCallback(async () => {
    try {
      await login();
    } catch (err: any) {
      if (err?.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  }, [login, clear]);

  const handleLogout = useCallback(async () => {
    await clear();
    queryClient.clear();
    setUserProfile(null);
  }, [clear, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoggingIn,
        identity,
        userProfile,
        profileLoading,
        login: handleLogin,
        logout: handleLogout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
