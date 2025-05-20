import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@prisma/client";

async function fetchCurrentUser() {
  const response = await fetch("/api/user/current");
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
}

export function useCurrentUser() {
  const { data: session, status } = useSession();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser", session?.user?.id],
    queryFn: fetchCurrentUser,
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  return {
    user: (user as User) || null,
    loading: status === "loading" || isLoading,
    isAuthenticated: !!user,
  };
}
