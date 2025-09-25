"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { getUrl } from "@/lib/get-url";
import { toast } from "react-toastify";
interface User {
  _id: string;
  username: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: User;
}
interface ErrorResponse {
  message: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = window.sessionStorage.getItem("token");
      if (!token) {
        console.log("token null!");
        setUser(null);
        setLoading(false);
        router.push("/login");
        return;
      }
      try {
        const response = await axios.get<LoginResponse>(
          `${getUrl()}/user/current-user`,
          { headers: { Authorization: "Bearer " + token } }
        );
        if (response.status === 200) {
          const { user } = response.data;

          setUser(user);
          const route = user?.role ?? "login";
          router.push("/" + route);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const login = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await axios.post<LoginResponse>(
        `${getUrl()}/user/login`,
        {
          username: credentials.username,
          password: credentials.password,
        }
      );
      if (response.status === 200) {
        const { token, user } = response.data;
        window.sessionStorage.setItem("token", token);
        console.log("data", response.data);
        setUser(user);
        router.push("/" + user.role);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;

      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Алдаа гарлаа. Дахин оролдоно уу.";

      console.error("Login failed:", axiosError.response?.data);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    window.sessionStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
