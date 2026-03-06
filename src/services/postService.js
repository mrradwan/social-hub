import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export async function getAllPosts() {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/posts`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function getPostById(id) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/posts/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function createPost(postData) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.post(`${baseURL}/posts`, postData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function toggleLikePost(postId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.put(`${baseURL}/posts/${postId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function toggleBookmarkPost(postId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.put(`${baseURL}/posts/${postId}/bookmark`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function sharePost(postId, content) {
  const token = localStorage.getItem("userToken");
  
  const { data } = await axios.post(`${baseURL}/posts/${postId}/share`, 
    { body: content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

export async function updatePost(postId, formData) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.put(`${baseURL}/posts/${postId}`, formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function deletePost(postId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.delete(`${baseURL}/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}
export async function getHomeFeed(limit = 10) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/posts/feed?only=following&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function getPostLikesDetails(postId, page = 1, limit = 20) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/posts/${postId}/likes?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}