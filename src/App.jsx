import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import AuthLayout from "./layouts/AuthLayout/AuthLayout";
import MainLayout from "./layouts/MainLayout/MainLayout";
import FeedDisplay from "./components/pages/FeedDisplay/FeedDisplay";
import Register from "./components/pages/Auth/Register/Register";
import NotFound from "./components/pages/NotFound/NotFound";
import Login from "./components/pages/Auth/Signin/Signin";
import "react-toastify/dist/ReactToastify.css";
import AppProtectedRouted from "./components/ProtectedRouted/AppProtectedRouted";
import AuthProtectedRouted from "./components/ProtectedRouted/AuthProtectedRouted";
import PostDetails from "./components/PostDetails/PostDetails";
import UserProfile from "./components/pages/UserProfile/UserProfile";
import Setting from "./components/pages/Setting/Setting";
import Notifications from "./components/pages/Notifications/Notifications";
import Suggested from "./components/Suggested/Suggested";
import OtherUserProfile from "./components/pages/UserProfile/OtherUserProfile";

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppProtectedRouted>
        <MainLayout />
      </AppProtectedRouted>
    ),
    children: [
      { index: true, element: <FeedDisplay feedType="feed" /> }, 
      { path: "userposts", element: <FeedDisplay feedType="my-posts" /> },
      { path: "community", element: <FeedDisplay feedType="community" /> },
      { path: "saved", element: <FeedDisplay feedType="saved" /> },

      { path: "profile/:id", element: <OtherUserProfile /> },
      { path: "profile", element: <UserProfile /> },
      { path: "settings", element: <Setting /> },
      { path: "suggested", element: <Suggested /> },
      { path: "notifications", element: <Notifications /> },
      { path: "post/:id", element: <PostDetails /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    element: (
      <AuthProtectedRouted>
        <AuthLayout />
      </AuthProtectedRouted>
    ),
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={routes}></RouterProvider>
    </>
  );
}