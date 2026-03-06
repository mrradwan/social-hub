import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export async function changePassword(passwordData) {
  const token = localStorage.getItem("userToken");

  const { data } = await axios.patch(
    `${baseURL}/users/change-password`,
    passwordData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
}
