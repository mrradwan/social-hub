import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export async function getNotifications(unread = false, page = 1, limit = 10) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/notifications?unread=${unread}&page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function getUnreadCount() {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function markNotificationAsRead(notificationId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.patch(`${baseURL}/notifications/${notificationId}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function markAllNotificationsAsRead() {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.patch(`${baseURL}/notifications/read-all`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}