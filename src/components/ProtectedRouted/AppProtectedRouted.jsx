import React, { useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";

export default function AppProtectedRouted({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
