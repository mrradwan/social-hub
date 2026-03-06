import React, { useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";

export default function AuthProtectedRouted({ children }) {
  const { token } = useContext(AuthContext);
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}
