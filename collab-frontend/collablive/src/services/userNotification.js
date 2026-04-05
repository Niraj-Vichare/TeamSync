import { useEffect, useRef, useState, useCallback } from "react";
import notificationHubService from "@/services/notificationHub";
import axiosInstance from "@/services/axiosInstance";

/**
 * useNotifications()
 *
 * Drop this into any component that renders the notification bell.
 * It handles:
 *   • Fetching the initial list + unread count on mount
 *   • Prepending real-time pushes from the SignalR hub
 *   • markRead(id)   — PATCH /notifications/{id}/read
 *   • markAllRead()  — PATCH /notifications/read-all
 *   • remove(id)     — DELETE /notifications/{id}
 *
 * Example:
 *   const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const pageRef = useRef(1);

  // ── Initial load ────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      const res = await axiosInstance.get("/notifications", {
        params: { pageNumber: page, pageSize: 20 },
      });
      if (res.data?.success) {
        setNotifications(page === 1 ? res.data.data : (p) => [...p, ...res.data.data]);
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

  // ── Mount: fetch + subscribe to hub ────────────────────────────────────
  useEffect(() => {
    fetchNotifications(1);
    fetchUnreadCount();

    // Hub should already be connected by the time this mounts (connected in AuthContext).
    // Register the real-time listener and keep the cleanup function.
    const unsubscribe = notificationHubService.onNotification((incoming) => {
      setNotifications((prev) => [incoming, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return unsubscribe;   // remove listener when component unmounts
  }, [fetchNotifications, fetchUnreadCount]);

  // ── Load more (pagination) ───────────────────────────────────────────────
  const loadMore = useCallback(() => {
    pageRef.current += 1;
    fetchNotifications(pageRef.current);
  }, [fetchNotifications]);

  // ── Mark one read ───────────────────────────────────────────────────────
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

  // ── Mark all read ────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await axiosInstance.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  }, []);

  // ── Delete one ───────────────────────────────────────────────────────────
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
    loadMore,
    markRead,
    markAllRead,
    remove,
  };
}