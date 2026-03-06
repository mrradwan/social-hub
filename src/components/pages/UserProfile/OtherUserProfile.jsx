import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import {
  LuArrowLeft,
  LuUserPlus,
  LuUserCheck,
  LuCalendarDays,
} from "react-icons/lu";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { getAvatar } from "../../lib/HelperFunctions/fn";

import {
  getOtherUserProfile,
  toggleFollowUser,
  getUserPosts,
} from "../../../services/userService";
import { ProfileContext } from "../../../context/ProfileContext";

// 💡 استيراد أجزاء البوست زي ما عملت في ملفك
import PostHeader from "../../PostCard/PostHeader";
import PostBody from "../../PostCard/PostBody";
import PostFooter from "../../PostCard/PostFooter";

export default function OtherUserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profileData } = useContext(ProfileContext);
  const myId = profileData?._id;

  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (id === myId) {
      navigate("/profile", { replace: true });
      return;
    }
    fetchProfileData();
  }, [id, myId]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, postsRes] = await Promise.all([
        getOtherUserProfile(id),
        getUserPosts(id),
      ]);

      setUserProfile(profileRes.data?.user || profileRes.data || profileRes);
      setUserPosts(postsRes.data?.posts || postsRes.data || []);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile.");
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setIsFollowLoading(true);
      await toggleFollowUser(id);

      setUserProfile((prev) => ({
        ...prev,
        isFollowing: !prev.isFollowing,
        followersCount: prev.isFollowing
          ? Math.max(0, prev.followersCount - 1)
          : (prev.followersCount || 0) + 1,
      }));
    } catch (error) {
      toast.error("Failed to update follow status.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-[#1877f2]" />
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="pb-10 space-y-3">
      <div className="sticky top-15 z-10 flex items-center gap-4 bg-white/90 px-4 py-2 backdrop-blur-md shadow-sm xl:top-[84px] rounded-b-2xl mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 cursor-pointer"
        >
          <LuArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">
            {userProfile.name}
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            {userPosts.length} posts
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-48 w-full bg-slate-200 sm:h-64 relative">
          {userProfile.coverPhoto ? (
            <img
              src={userProfile.coverPhoto}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-r from-slate-200 to-slate-300"></div>
          )}
        </div>

        <div className="px-4 sm:px-8 pb-6">
          <div className="relative flex justify-between sm:items-end flex-col sm:flex-row gap-4 sm:gap-0">
            <div className="-mt-16 sm:-mt-20 relative z-10">
              <img
                src={getAvatar(userProfile.photo)}
                alt={userProfile.name}
                className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white object-cover shadow-md bg-white"
              />
            </div>

            <div className="pt-2 sm:pt-0 sm:pb-4">
              <button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-8 py-2.5 text-sm font-bold transition disabled:opacity-70 cursor-pointer ${
                  userProfile.isFollowing
                    ? "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
                    : "bg-[#1877f2] text-white hover:bg-[#166fe5]"
                }`}
              >
                {isFollowLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : userProfile.isFollowing ? (
                  <>
                    <LuUserCheck size={18} /> Following
                  </>
                ) : (
                  <>
                    <LuUserPlus size={18} /> Follow
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {userProfile.name}
            </h2>
            <p className="font-semibold text-slate-500">
              @{userProfile.username || "username"}
            </p>
          </div>

          {userProfile.bio && (
            <p className="mt-3 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {userProfile.bio}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm font-semibold text-slate-500">
            {userProfile.createdAt && (
              <span className="flex items-center gap-1.5">
                <LuCalendarDays size={16} /> Joined{" "}
                {new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            <div className="flex items-center gap-4 text-slate-800">
              <span className="hover:underline cursor-pointer">
                <strong className="text-slate-900">
                  {userProfile.followingCount || 0}
                </strong>{" "}
                <span className="text-slate-500">Following</span>
              </span>
              <span className="hover:underline cursor-pointer">
                <strong className="text-slate-900">
                  {userProfile.followersCount || 0}
                </strong>{" "}
                <span className="text-slate-500">Followers</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-4 text-lg font-extrabold text-slate-900 px-2">
          Posts
        </h3>

        {userPosts.length > 0 ? (
          <div className="space-y-4">
            {/* 💡 عرض البوستات بنفس طريقة ملفك الأساسي */}
            {userPosts.map((post) => (
              <article
                key={post.id || post._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_6px_rgba(15,23,42,.05)] transition hover:shadow-sm"
              >
                <PostHeader post={post} />
                <PostBody post={post} />
                <PostFooter post={post} />
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-800">No posts yet</p>
            <p className="text-sm text-slate-500 mt-1">
              When {userProfile.name} posts something, it will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
