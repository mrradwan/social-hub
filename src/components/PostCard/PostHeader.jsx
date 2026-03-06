import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router";

// --- Icons & UI Components ---
import { 
  LuEarth, 
  LuEllipsis, 
  LuBookmark, 
  LuPencil, 
  LuTrash2, 
  LuX, 
  LuImage 
} from "react-icons/lu";
import { FaSpinner } from "react-icons/fa";
import Swal from 'sweetalert2';
import { toast } from "react-toastify";

// --- Services, Context & Helpers ---
import { toggleBookmarkPost, deletePost, updatePost } from "../../services/postService";
import { ProfileContext } from "../../context/ProfileContext";
import { getAvatar } from "../lib/HelperFunctions/fn";

/**
 * PostHeader Component
 * Displays the author info, timestamp, privacy, and an options menu (Edit/Delete/Bookmark).
 * Implements Optimistic UI for immediate visual feedback on updates and deletions.
 */
export default function PostHeader({ post }) {
  // --- Context & Global State ---
  const { profileData } = useContext(ProfileContext);
  const myId = profileData?._id;

  // --- UI States ---
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post?.bookmarked || false);

  // --- Display States (Used for Optimistic UI Updates) ---
  const [currentBody, setCurrentBody] = useState(post?.body || "");
  const [currentImage, setCurrentImage] = useState(post?.image || null);
  
  // --- Form States (Used inside the Edit Modal) ---
  const [editContent, setEditContent] = useState(post?.body || "");
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(post?.image || null);

  const hasValidImage = currentImage !== null && currentImage !== undefined && currentImage !== "";

  // Sync local states if the post prop changes
  useEffect(() => {
    setIsBookmarked(post?.bookmarked || false);
    setCurrentBody(post?.body || "");
    setCurrentImage(post?.image || null);
  }, [post?.bookmarked, post?.body, post?.image]);

  /**
   * Toggles the bookmark status of the post.
   */
  const handleBookmark = async () => {
    if (!myId) {
      toast.warning("Please login to save posts.");
      return;
    }

    try {
      // Optimistic UI toggle
      setIsBookmarked(!isBookmarked);
      setIsOpen(false); 
      
      await toggleBookmarkPost(post._id || post.id);
      
      if (!isBookmarked) {
        toast.success("Post saved to bookmarks!");
      } else {
        toast.info("Removed from bookmarks.");
      }
    } catch (error) {
      // Revert if API fails
      setIsBookmarked(!isBookmarked);
      console.error("Bookmark Error:", error);
      toast.error("Failed to update bookmark.");
    }
  };

  /**
   * Handles post deletion with a confirmation dialog.
   * Removes the post from the DOM immediately upon success (No page reload).
   */
  const handleDelete = async () => {
    setIsOpen(false);

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48', 
      cancelButtonColor: '#94a3b8', 
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(true);
        await deletePost(post._id || post.id);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Your post has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        // 💡 Optimistic UI trick: Remove the parent <article> from the DOM completely
        const postElement = document.getElementById(`post-header-${post._id || post.id}`);
        if (postElement) {
          postElement.closest('article').remove();
        }
        
      } catch (error) {
        console.error("Delete Error:", error);
        toast.error("Failed to delete post.");
        setIsDeleting(false);
      }
    }
  };

  /**
   * Handles image selection in the edit modal.
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file)); 
    }
  };

  /**
   * Submits the edited post data and updates the UI optimistically.
   */
  const handleEditSubmit = async () => {
    try {
      setIsUpdating(true);
      const formData = new FormData();
      
      if (editContent) formData.append("body", editContent);
      if (editImage) formData.append("image", editImage);

      await updatePost(post._id || post.id, formData);
      toast.success("Post updated successfully!");
      
      // 💡 Update display states to reflect changes immediately
      setCurrentBody(editContent);
      if (editImagePreview) setCurrentImage(editImagePreview);
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update post.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    // Unique ID required for the DOM manipulation deletion trick
    <div id={`post-header-${post._id || post.id}`} className="relative p-4">
      
      {/* Deletion Loading Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
          <FaSpinner className="animate-spin text-3xl text-rose-500" />
        </div>
      )}

      {/* --- Header Info --- */}
      <div className="flex items-center gap-3">
        <Link className="shrink-0" to={`/profile/${post?.user?._id}`}>
          <img
            className="h-11 w-11 rounded-full object-cover"
            src={getAvatar(post?.user?.photo)}
            alt={post?.user?.name}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            className="truncate text-sm font-bold text-slate-900 hover:underline"
            to={`/profile/${post?.user?._id}`}
          >
            {post?.user?.name || "Unknown User"}
          </Link>

          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
            @{post?.user?.username}
            <span className="mx-1">•</span>
            <button
              type="button"
              className="cursor-default rounded px-0.5 py-0.5 text-xs font-semibold transition hover:bg-slate-100 hover:text-slate-700"
            >
              {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now"}
            </button>
            <span className="mx-1">•</span>
            <span className="inline-flex items-center gap-1 capitalize">
              <LuEarth />
              {post?.privacy || "public"}
            </span>
          </div>
        </div>

        {/* --- Options Menu (Three Dots) --- */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LuEllipsis />
          </button>

          {isOpen && (
            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              
              {/* Bookmark Button */}
              <button 
                onClick={handleBookmark}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LuBookmark className={isBookmarked ? "fill-[#1877f2] text-[#1877f2]" : ""} />
                {isBookmarked ? "Unsave post" : "Save post"}
              </button>
              
              {/* Edit & Delete (Visible only to the post author) */}
              {myId === post?.user?._id && (
                <>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      setIsEditModalOpen(true);
                      // Reset modal data to match current post state
                      setEditContent(currentBody);
                      setEditImagePreview(currentImage);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <LuPencil />
                    Edit post
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LuTrash2 />
                    Delete post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- Main Post Text Content --- */}
      {/* Renders currentBody to immediately reflect edits */}
      {currentBody && hasValidImage && (
        <div className="mt-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {currentBody}
          </p>
        </div>
      )}

      {/* --- Edit Post Modal --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 overflow-hidden rounded-2xl bg-white shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-extrabold text-slate-900">Edit Post</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="cursor-pointer rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
              >
                <LuX />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <img 
                  src={getAvatar(profileData?.photo)} 
                  alt="You" 
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover" 
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{profileData?.name}</p>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="mt-2 w-full resize-none bg-transparent text-slate-800 outline-none placeholder:text-slate-500"
                    rows="4"
                    autoFocus
                  ></textarea>
                </div>
              </div>

              {/* Image Preview */}
              {editImagePreview && (
                <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <img src={editImagePreview} alt="Preview" className="max-h-60 w-full object-cover" />
                  <button 
                    onClick={() => {
                      setEditImage(null);
                      setEditImagePreview(null);
                    }}
                    className="absolute right-2 top-2 cursor-pointer rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
                  >
                    <LuX />
                  </button>
                </div>
              )}

              {/* Image Upload Button */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 p-3 shadow-sm">
                <span className="text-sm font-bold text-slate-700">Add to your post</span>
                <label className="cursor-pointer rounded-full bg-slate-100 p-2 text-emerald-500 transition hover:bg-emerald-50">
                  <LuImage size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={isUpdating || (!editContent.trim() && !editImagePreview)}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1877f2] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUpdating ? <FaSpinner className="animate-spin" /> : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}