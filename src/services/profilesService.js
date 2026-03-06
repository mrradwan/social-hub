import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export async function getUserProfile() {
  const token = localStorage.getItem("userToken");

  const { data } = await axios.get(`${baseURL}/users/profile-data`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function uploadProfilePhoto(formData) {
  const token = localStorage.getItem("userToken");

  const { data } = await axios.put(`${baseURL}/users/upload-photo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}
export async function getUserBookmarks() {
  const token = localStorage.getItem("userToken");

  const { data } = await axios.get(`${baseURL}/users/bookmarks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function uploadCoverPhoto(formData) {
  const token = localStorage.getItem("userToken");
  const baseURL = import.meta.env.VITE_BASE_URL;

  const { data } = await axios.put(`${baseURL}/users/upload-cover`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function deleteCoverPhoto() {
  const token = localStorage.getItem("userToken");
  const baseURL = import.meta.env.VITE_BASE_URL;

  const { data } = await axios.delete(`${baseURL}/users/delete-cover`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}