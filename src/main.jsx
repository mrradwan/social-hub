import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { HeroUIProvider } from "@heroui/react";
import { ToastContainer } from "react-toastify";
import AuthContextProvider from "./context/AuthContext.jsx";
import ProfileContextProvider from "./context/ProfileContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HeroUIProvider>
      <AuthContextProvider>
        <ToastContainer />
        <ProfileContextProvider>
          <App />
        </ProfileContextProvider>
      </AuthContextProvider>
    </HeroUIProvider>
  </StrictMode>,
);
