import React from "react";
import { useNavigate } from "react-router";
import { LuExternalLink } from "react-icons/lu";

// --- Helpers ---
import { getAvatar } from "../lib/HelperFunctions/fn";

/**
 * PostBody Component
 * Renders the main content of a post. It handles three different UI states:
 * 1. Text-only posts (renders a colored block with text).
 * 2. Image posts (renders the uploaded image).
 * 3. Shared posts (renders the user's caption alongside a nested card containing the original post).
 *
 * @param {Object} props.post - The post data object provided by the parent.
 */
export default function PostBody({ post }) {
  const navigate = useNavigate();

  // Determine if the post has a valid image attached directly
  const hasValidImage = post?.image !== null && post?.image !== undefined && post?.image !== "";

  // Extract shared post content if it exists
  const sharedContent = post?.sharedPost;

  /**
   * Prevents the outer post click event from firing when the user interacts
   * with nested links or buttons (e.g., clicking the original author's profile link).
   *
   * @param {Event} e - The click event object
   * @param {string} path - The route path to navigate to
   */
  const handleInnerLinkClick = (e, path) => {
    e.preventDefault();
    e.stopPropagation(); // Stops the event from bubbling up to the main post wrapper
    navigate(path);
  };

  return (
    <div
      onClick={() => navigate(`/post/${post?.id || post?._id}`)}
      className="cursor-pointer"
    >
      
      {/* --- 1. Caption for Shared Posts --- */}
      {/* Renders if the user added their own text while sharing someone else's post */}
      {post?.body && sharedContent && (
        <p className="mb-2 px-4 text-left text-sm whitespace-pre-wrap text-slate-800">
          {post.body}
        </p>
      )}

      {/* --- 2. Content Rendering --- */}
      {sharedContent ? (
        
        /* --- State A: Shared Post UI --- */
        <div className="mx-4 mb-3 mt-2 rounded-xl border border-slate-200 bg-[#f8fafc] p-3 transition hover:bg-slate-50 sm:p-4">
          
          {/* Original Post Header (Author info) */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleInnerLinkClick(e, `/profile/${sharedContent?.user?._id}`)}
              >
                <img
                  src={getAvatar(sharedContent?.user?.photo)}
                  alt={sharedContent?.user?.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </button>
              <div className="flex flex-col text-left leading-tight">
                <button
                  onClick={(e) => handleInnerLinkClick(e, `/profile/${sharedContent?.user?._id}`)}
                  className="text-sm font-extrabold text-slate-900 hover:underline"
                >
                  {sharedContent?.user?.name || "Original User"}
                </button>
                <span className="mt-0.5 text-xs font-semibold text-slate-500">
                  @{sharedContent?.user?.username || "username"}
                </span>
              </div>
            </div>

            {/* Link to the Original Post */}
            <button
              onClick={(e) => handleInnerLinkClick(e, `/post/${sharedContent?._id}`)}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#1877f2] transition hover:underline"
            >
              Original Post <LuExternalLink size={14} />
            </button>
          </div>

          {/* Original Post Body (Text) */}
          {sharedContent?.body && (
            <p className="mb-2 text-left text-sm whitespace-pre-wrap text-slate-800">
              {sharedContent.body}
            </p>
          )}

          {/* Original Post Image */}
          {sharedContent?.image && (
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
              <img
                src={sharedContent.image}
                alt="Shared content"
                className="max-h-100 w-full object-cover"
              />
            </div>
          )}
        </div>

      ) : (

        /* --- State B: Standard Post UI (No Shared Content) --- */
        <>
          {hasValidImage ? (
            
            /* Standard Post with Image */
            <div className="max-h-155 overflow-hidden border-y border-slate-200">
              <button className="group relative block w-full cursor-zoom-in">
                <img
                  src={post.image}
                  alt="post content"
                  className="w-full object-cover"
                />
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10"></span>
              </button>
            </div>

          ) : (
            
            /* Standard Post without Image (Text-only Block) */
            post?.body && (
              <div className="flex h-50 w-full items-center justify-center bg-danger-500 p-4 text-center text-white">
                <p className="capitalize text-3xl">{post.body}</p>
              </div>
            )

          )}
        </>
      )}
    </div>
  );
}