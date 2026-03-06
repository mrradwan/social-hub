import React, { useState, useEffect, useContext } from "react";
import { FaSpinner } from "react-icons/fa";
import { ProfileContext } from "../../../context/ProfileContext";

// 💡 1. استيراد مكون إضافة البوست (تأكد من مسار الملف عندك)
import AddPost from "../../AddPost/AddPost"; 

// 💡 استيراد الـ APIs اللي عملناها قبل كده
import { getHomeFeed, getAllPosts } from "../../../services/postService";
import { getUserBookmarks } from "../../../services/profilesService";
import { getUserPosts } from "../../../services/userService";

// 💡 استيراد أجزاء البوست
import PostHeader from "../../PostCard/PostHeader";
import PostBody from "../../PostCard/PostBody";
import PostFooter from "../../PostCard/PostFooter";






export default function FeedDisplay({ feedType }) {
  const { profileData } = useContext(ProfileContext);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profileData?._id) {
      fetchPosts();
    }
  }, [feedType, profileData]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setPosts([]);

    try {
      let response;
      let fetchedPosts = [];

      if (feedType === "feed") {
        response = await getHomeFeed(20);
        fetchedPosts = response.data?.posts || response.posts || response.data || [];
      } else if (feedType === "community") {
        response = await getAllPosts();
        fetchedPosts = response.data?.posts || response.posts || response.data || [];
      } else if (feedType === "my-posts") {
        response = await getUserPosts(profileData._id);
        fetchedPosts = response.data?.posts || response.posts || response.data || [];
      } else if (feedType === "saved") {
        response = await getUserBookmarks();
        let savedData = response.bookmarks || response.data?.bookmarks || response.data || [];
        if (savedData.length > 0 && savedData[0].post) {
          savedData = savedData.map((item) => item.post);
        }
        fetchedPosts = savedData;
      }

      setPosts(fetchedPosts);
    } catch (error) {
      console.error(`Error fetching ${feedType} posts:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (feedType === "feed") return "Your Feed";
    if (feedType === "community") return "Community Posts";
    if (feedType === "my-posts") return "My Posts";
    if (feedType === "saved") return "Saved Posts";
  };

  return (
    <div className="w-full space-y-4 pb-10">
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900">{getTitle()}</h1>
        <span className="rounded-full bg-[#e7f3ff] px-3 py-1 text-xs font-bold text-[#1877f2]">
          {posts.length} Posts
        </span>
      </div>

      {/* 💡 2. عرض صندوق إضافة بوست (مخفي بس في صفحة المحفوظات) */}
      {feedType !== "saved" && (
        <AddPost fetchAllPosts={fetchPosts} />
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <FaSpinner className="animate-spin text-4xl text-[#1877f2]" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post._id || post.id}
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
          <p className="text-lg font-bold text-slate-800">
            {feedType === "saved" ? "No saved posts yet." : "No posts found."}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {feedType === "feed" ? "Follow some users to see their posts here!" : "Check back later."}
          </p>
        </div>
      )}
    </div>
  );
}