import { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();
  const API_URL =
    process.env.REACT_APP_API_URL || "https://api.chainlottery.space/api";

  // Generate a message for signing
  const generateMessage = (address) => {
    return `Sign this message to authenticate with ChainLottery for address: ${address} at ${new Date().toISOString()}`;
  };

  // Verify JWT with backend
  const verifyToken = async (jwt) => {
    try {
      const response = await axios.get(`${API_URL}/verify`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (response.data.valid) {
        setIsAuthenticated(true);
        setToken(jwt);
        localStorage.setItem("jwt", jwt);
        toast({
          title: "Authentication Successful",
          description: "You are now logged in.",
        });
      } else {
        setIsAuthenticated(false);
        setToken(null);
        localStorage.removeItem("jwt");
        toast({
          title: "Authentication Failed",
          description: "Invalid token.",
          variant: "destructive",
        });
        await handleDisconnect();
      }
    } catch (err) {
      console.error("Token verification failed:", err.message);
      setIsAuthenticated(false);
      setToken(null);
      localStorage.removeItem("jwt");
      toast({
        title: "Authentication Error",
        description: err.message,
        variant: "destructive",
      });
      await handleDisconnect();
    }
  };

  const authenticate = async () => {
    if (!isConnected || !address) {
      try {
        await open();
      } catch (err) {
        console.error("Wallet connection failed:", err.message);
        toast({
          title: "Connection Failed",
          description: err.message,
          variant: "destructive",
        });
      }
      return;
    }

    try {
      const message = generateMessage(address);
      const signature = await signMessageAsync({ message });

      // Send to backend /auth endpoint
      const response = await axios.post(`${API_URL}/auth`, {
        signature,
        message,
        address,
      });

      const { token } = response.data;
      if (token) {
        await verifyToken(token);
        setHasAttemptedAuth(true);
      }
    } catch (err) {
      console.error("Authentication failed:", err.message);
      setIsAuthenticated(false);
      setToken(null);
      localStorage.removeItem("jwt");
      toast({
        title: "Authentication Failed",
        description: err.message,
        variant: "destructive",
      });
      await handleDisconnect();
    }
  };

  // Handle disconnection
  const handleDisconnect = async () => {
    try {
      await open({ view: "Account" });
      setIsAuthenticated(false);
      setToken(null);
      setHasAttemptedAuth(false);
      localStorage.removeItem("jwt");
      toast({
        title: "Disconnected",
        description: "You have been logged out.",
      });
    } catch (err) {
      console.error("Disconnection failed:", err.message);
      toast({
        title: "Disconnection Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("jwt");
    if (storedToken) {
      verifyToken(storedToken);
    }
  }, []);

  // Handle wallet connection changes
  useEffect(() => {
    if (isConnected && address && !token && !hasAttemptedAuth) {
      authenticate();
    } else if (!isConnected) {
      setIsAuthenticated(false);
      setToken(null);
      setHasAttemptedAuth(false);
      localStorage.removeItem("jwt");
    }
  }, [isConnected, address, hasAttemptedAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        authenticate,
        handleDisconnect,
        address,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import { createContext } from "react";
export const AuthContext = createContext({
  isAuthenticated: false,
  token: null,
  authenticate: () => {},
  handleDisconnect: () => {},
  address: null,
});

export default AuthProvider;
