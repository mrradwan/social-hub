import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export async function getOtherUserProfile(userId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/users/${userId}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function toggleFollowUser(userId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.put(`${baseURL}/users/${userId}/follow`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function getFollowSuggestions(limit = 10) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/users/suggestions?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function getUserPosts(userId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/users/${userId}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}