import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

// --- Services & Sub-Components ---
import { getPostById } from "../../services/postService"; 
import PostHeader from "../PostCard/PostHeader"; 
import PostBody from "../PostCard/PostBody"; 
import PostFooter from "../PostCard/PostFooter"; 
import PostSkeletons from "../Skeletons/PostSkeletons"; 

/**
 * PostDetails Component
 * Fetches and displays a single post in full detail based on the URL ID parameter.
 * Renders a skeleton loader during the fetch and an error state if the post is not found.
 */
export default function PostDetails() {
  // --- Routing & States ---
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Fetch Logic ---
  useEffect(() => {
    const fetchPostDetails = async () => {
      // Prevent fetching if no ID is present in the URL
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await getPostById(id);
        
        // Safely extract the post object from various possible API response structures
        const postData = response.data?.post || response.post || response.data || response; 
        
        setPost(postData);
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  // --- Renders ---

  // 1. Loading State
  if (isLoading) {
    return <PostSkeletons />;
  }

  // 2. Not Found / Error State
  if (!post) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <p className="text-lg font-bold text-rose-600">
          Post not found or unavailable.
        </p>
      </div>
    );
  }

  // 3. Success State (Single Post View)
  return (
    <article className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
      <PostHeader post={post} />
      <PostBody post={post} />
      <PostFooter post={post} />
    </article>
  );
}