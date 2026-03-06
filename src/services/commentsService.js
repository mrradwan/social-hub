import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export async function getAllComments(postId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/posts/${postId}/comments?page=1&limit=10`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function createComment(postId, commentData) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.post(`${baseURL}/posts/${postId}/comments?`, commentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function likeComment(postId, commentId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.put(`${baseURL}/posts/${postId}/comments/${commentId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function replyToComment(postId, commentId, formData) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.post(`${baseURL}/posts/${postId}/comments/${commentId}/replies`, formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function getCommentReplies(postId, commentId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(`${baseURL}/posts/${postId}/comments/${commentId}/replies`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function updateComment(postId, commentId, formData) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.put(`${baseURL}/posts/${postId}/comments/${commentId}`, formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function deleteComment(postId, commentId) {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.delete(`${baseURL}/posts/${postId}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}