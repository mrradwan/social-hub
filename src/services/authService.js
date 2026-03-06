import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL

export async function registerUser(body) {
  const { data } = await axios.post(`${baseURL}/users/signup`, body);
  return data;
}

export async function signIn(body) {
  const { data } = await axios.post(`${baseURL}/users/signin`, body);
  return data;
}
