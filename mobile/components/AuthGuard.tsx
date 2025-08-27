import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { storage } from "../services/api";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storage.getToken();
      const user = await storage.getUser();
      
      if (!token || !user) {
        router.replace("/auth/login");
        setIsAuthenticated(false);
        return;
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      console.log("Auth guard error:", error);
      router.replace("/auth/login");
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
