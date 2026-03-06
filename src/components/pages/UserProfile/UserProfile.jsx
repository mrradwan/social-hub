import React, { useContext, useState, useEffect } from "react";
import {
  LuCamera,
  LuExpand,
  LuUsers,
  LuMail,
  LuFileText,
  LuBookmark,
  LuX,
} from "react-icons/lu";
import { ProfileContext } from "../../../context/ProfileContext";
import dAvatar from "../../../img/default-profile.png";
import { Skeleton } from "@heroui/react";
import PostHeader from "../../PostCard/PostHeader";
import PostBody from "../../PostCard/PostBody";
import PostFooter from "../../PostCard/PostFooter";
import { getAllPosts } from "../../../services/postService";
import { getUserBookmarks, uploadProfilePhoto, uploadCoverPhoto } from "../../../services/profilesService";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";

export default function UserProfile() {
  const { profileData, isLoadingProfile, getUserProfile } = useContext(ProfileContext);
  
  const [expandedImage, setExpandedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [myPostsCount, setMyPostsCount] = useState(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("cover", file);

    try {
      setIsUploadingCover(true);
      const response = await uploadCoverPhoto(formData);

      console.log("Cover uploaded:", response);
      toast.success("Cover photo updated successfully!");

      if (getUserProfile) {
        await getUserProfile(); 
      }
    } catch (error) {
      console.error("Error uploading cover:", error);
      toast.error("Failed to update cover photo.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoadingPosts(true);

        if (activeTab === "posts") {
          const response = await getAllPosts();
          const myPosts = response.data.posts.filter(
            (post) => post.user._id === profileData?._id,
          );
          setUserPosts(myPosts);
          setMyPostsCount(myPosts.length);
        } else if (activeTab === "saved") {
          const response = await getUserBookmarks();
          console.log("Bookmarks API Response:", response);

          let savedData =
            response.bookmarks ||
            response.data?.bookmarks ||
            response.data ||
            [];

          if (savedData.length > 0 && savedData[0].post) {
            savedData = savedData.map((item) => item.post);
          }

          setUserPosts(savedData);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    }

    if (profileData?._id) {
      fetchPosts();
    }
  }, [activeTab, profileData]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setIsUploadingPhoto(true);
      const response = await uploadProfilePhoto(formData);

      console.log("Photo uploaded:", response);
      toast.success("Profile photo updated successfully!");

      if (getUserProfile) {
        await getUserProfile();
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to update profile photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <>
      <main className="min-w-0">
        <div className="space-y-5 sm:space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,.06)] sm:rounded-[28px]">
            {/* Cover Section */}
            <div className="group/cover relative h-44 sm:h-52 lg:h-60 overflow-hidden bg-slate-200">
              {profileData?.cover ? (
                <img
                  src={profileData.cover}
                  alt="Profile Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(112deg,#0f172a_0%,#1e3a5f_36%,#2b5178_72%,#5f8fb8_100%)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(255,255,255,.14)_0%,rgba(255,255,255,0)_36%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(186,230,253,.22)_0%,rgba(186,230,253,0)_44%)]"></div>
                  <div className="absolute -left-16 top-10 h-36 w-36 rounded-full bg-white/8 blur-3xl"></div>
                  <div className="absolute right-8 top-6 h-48 w-48 rounded-full bg-[#c7e6ff]/10 blur-3xl"></div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent"></div>

              <div className="pointer-events-none absolute right-2 top-2 z-10 flex max-w-[90%] flex-wrap items-center justify-end gap-1.5 opacity-100 transition duration-200 sm:right-3 sm:top-3 sm:max-w-none sm:gap-2 sm:opacity-0 sm:group-hover/cover:opacity-100 sm:group-focus-within/cover:opacity-100">
                {profileData?.cover && (
                  <button
                    type="button"
                    onClick={() => setExpandedImage(profileData.cover)}
                    className="pointer-events-auto inline-flex cursor-pointer items-center gap-1 rounded-lg bg-black/45 px-2 py-1 text-[11px] font-bold text-white backdrop-blur transition hover:bg-black/60 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs"
                  >
                    <LuExpand />
                    View
                  </button>
                )}

                <label
                  className={`pointer-events-auto inline-flex items-center gap-1 rounded-lg bg-black/45 px-2 py-1 text-[11px] font-bold text-white backdrop-blur transition hover:bg-black/60 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs ${
                    isUploadingCover
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  }`}
                >
                  {isUploadingCover ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <LuCamera />
                  )}
                  {isUploadingCover
                    ? "Uploading..."
                    : profileData?.cover
                      ? "Change"
                      : "Add cover"}
                  <input
                    accept="image/*"
                    className="hidden"
                    type="file"
                    onChange={handleCoverUpload}
                    disabled={isUploadingCover}
                  />
                </label>
              </div>
            </div>

            <div className="relative -mt-12 px-3 pb-5 sm:-mt-16 sm:px-8 sm:pb-6">
              <div className="rounded-3xl border border-white/60 bg-white/92 p-5 backdrop-blur-xl sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  {/* User Info Section */}
                  <div className="min-w-0">
                    <div className="flex items-end gap-4">
                      <div className="group/avatar relative shrink-0">
                        <button
                          type="button"
                          className="cursor-zoom-in rounded-full relative"
                          onClick={() => setExpandedImage(profileData?.photo || dAvatar)}
                        >
                          {isUploadingPhoto && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/40">
                              <FaSpinner className="animate-spin text-white text-2xl" />
                            </div>
                          )}

                          {isLoadingProfile ? (
                            <Skeleton className="h-28 w-28 rounded-full border-4 border-white shadow-md ring-2 ring-[#dbeafe]" />
                          ) : (
                            <img
                              src={profileData?.photo || dAvatar}
                              alt={profileData?.name || "User Avatar"}
                              className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-[#dbeafe]"
                            />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedImage(profileData?.photo || dAvatar)
                          }
                          className="absolute bottom-1 left-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-[#1877f2] opacity-100 shadow-sm ring-1 ring-slate-200 transition duration-200 hover:bg-slate-50 sm:opacity-0 sm:group-hover/avatar:opacity-100 sm:group-focus-within/avatar:opacity-100"
                        >
                          <LuExpand />
                        </button>

                        <label
                          className={`absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2] text-white opacity-100 shadow-sm transition duration-200 hover:bg-[#166fe5] sm:opacity-0 sm:group-hover/avatar:opacity-100 sm:group-focus-within/avatar:opacity-100 ${isUploadingPhoto ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        >
                          {isUploadingPhoto ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <LuCamera />
                          )}
                          <input
                            accept="image/*"
                            className="hidden"
                            type="file"
                            onChange={handlePhotoUpload}
                            disabled={isUploadingPhoto}
                          />
                        </label>
                      </div>

                      <div className="min-w-0 pb-1">
                        {isLoadingProfile ? (
                          <Skeleton className="h-8 w-48 rounded-lg mb-2" />
                        ) : (
                          <h2 className="truncate text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            {profileData?.name || "Loading..."}
                          </h2>
                        )}
                        <p className="mt-1 text-lg font-semibold text-slate-500 sm:text-xl">
                          @
                          {profileData?.email
                            ? profileData.email.split("@")[0]
                            : "username"}
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d7e7ff] bg-[#eef6ff] px-3 py-1 text-xs font-bold text-[#0b57d0]">
                          <LuUsers />
                          Route Posts member
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="grid w-full grid-cols-3 gap-2 lg:w-[520px]">
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                        Followers
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        {profileData?.followersCount || 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                        Following
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        {profileData?.followingCount || 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                        Bookmarks
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        {profileData?.bookmarksCount ||
                          profileData?.bookmarks?.length ||
                          0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-extrabold text-slate-800">
                      About
                    </h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <LuMail className="text-slate-500" />
                        {profileData?.email || "No email available"}
                      </p>
                      <p className="flex items-center gap-2">
                        <LuUsers className="text-slate-500" />
                        Active on Route Posts
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-2xl border border-[#dbeafe] bg-[#f6faff] px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#1f4f96]">
                        My posts
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-900">
                        {myPostsCount || 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#dbeafe] bg-[#f6faff] px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#1f4f96]">
                        Saved posts
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-900">
                        {profileData?.bookmarks?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs & Posts Section */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 sm:inline-flex sm:w-auto sm:gap-0">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition cursor-pointer ${
                    activeTab === "posts"
                      ? "bg-white text-[#1877f2] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LuFileText />
                  My Posts
                </button>

                <button
                  onClick={() => setActiveTab("saved")}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition cursor-pointer ${
                    activeTab === "saved"
                      ? "bg-white text-[#1877f2] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LuBookmark />
                  Saved
                </button>
              </div>
              <span className="rounded-full bg-[#e7f3ff] px-3 py-1 text-xs font-bold text-[#1877f2]">
                {activeTab === "posts"
                  ? userPosts.length
                  : profileData?.bookmarks?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {isLoadingPosts ? (
                <div className="flex justify-center items-center py-10">
                  <FaSpinner className="animate-spin text-4xl text-[#1877f2]" />
                </div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <article
                    key={post.id || post._id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_6px_rgba(15,23,42,.05)] transition hover:shadow-sm"
                  >
                    <PostHeader post={post} />
                    <PostBody post={post} />
                    <PostFooter post={post} />
                  </article>
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-500 font-bold">
                    {activeTab === "posts"
                      ? "No posts yet."
                      : "No saved posts yet."}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
        
        {/* Modal تكبير الصورة */}
        {expandedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <button
              onClick={() => setExpandedImage(null)} 
              className="absolute right-4 top-4 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8 sm:top-8"
            >
              <LuX size={28} />
            </button>

            <div className="relative max-h-[90vh] max-w-[90vw]">
              <img
                src={expandedImage}
                alt="Expanded View"
                className="max-h-[85vh] w-auto max-w-full rounded-xl border-2 border-white/20 object-contain shadow-2xl"
              />
            </div>

            <div
              className="absolute inset-0 -z-10 cursor-pointer"
              onClick={() => setExpandedImage(null)}
            ></div>
          </div>
        )}
      </main>
    </>
  );
}