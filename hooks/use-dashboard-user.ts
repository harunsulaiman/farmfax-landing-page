"use client";

import { useCallback, useEffect, useState } from "react";

interface DashboardUser {
  displayName: string;
  email: string;
  fullName: string | null;
  role: string;
  profilePictureUrl: string | null;
}

export function useDashboardUser(fallbackName: string): {
  userName: string;
  avatarUrl: string | null;
  refreshUser: () => Promise<void>;
} {
  const [userName, setUserName] = useState(fallbackName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return;
    const data = (await res.json()) as { user: DashboardUser };
    if (data.user?.displayName) setUserName(data.user.displayName);
    setAvatarUrl(data.user?.profilePictureUrl ?? null);
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  return { userName, avatarUrl, refreshUser };
}
