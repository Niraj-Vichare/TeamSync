import { useEffect, useRef, useState, useCallback } from "react";
import notificationHubService from "@/services/notificationHub";
import axiosInstance from "@/services/axiosInstance";

const PAGE_SIZE = 20;

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const fetchNotifications = useCallback(async (page = 1, replace = false) => {
    try {
      const res = await axiosInstance.get("/notifications", {
        params: { pageNumber: page, pageSize: PAGE_SIZE },
      });

      if (res.data?.success) {
        const incoming = Array.isArray(res.data.data) ? res.data.data : [];

        setNotifications((prev) => {
          const merged = replace || page === 1 ? incoming : [...prev, ...incoming];
          return Array.from(new Map(merged.map((n) => [n.id, n])).values());
        });

        setHasMore(incoming.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/notifications/unread-count");
      if (res.data?.success) setUnreadCount(res.data.data.count ?? 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    setLoading(true);
    await Promise.all([
      fetchNotifications(1, true),
      fetchUnreadCount(),
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    refresh();

    const unsubscribe = notificationHubService.onNotification((incoming) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === incoming.id)) return prev;
        return [incoming, ...prev];
      });

      if (!incoming.isRead) {
        setUnreadCount((c) => c + 1);
      }
    });

    return unsubscribe;
  }, [refresh]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    pageRef.current += 1;
    fetchNotifications(pageRef.current);
  }, [fetchNotifications, hasMore, loading]);

  const markRead = useCallback(async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await axiosInstance.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadMore,
    refresh,
    markRead,
    markAllRead,
    remove,
  };
}