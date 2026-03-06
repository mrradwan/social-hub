import React, { useState, useRef, useContext } from "react";

// --- External Libraries & Icons ---
import { Select, SelectItem, Skeleton } from "@heroui/react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-toastify";
import {
  LuSend,
  LuSmile,
  LuImage,
  LuEarth,
  LuX,
  LuUsers,
  LuLock,
} from "react-icons/lu";
import { FaSpinner } from "react-icons/fa";

// --- Internal Services, Context & Assets ---
import { createPost } from "../../services/postService";
import { ProfileContext } from "../../context/ProfileContext";
import avatar from "../../img/default-profile.png";

/**
 * AddPost Component
 * Handles the creation of new posts including text, emojis, image uploads, and privacy settings.
 * * @param {function} fetchAllPosts - Callback to refresh the feed after a successful post.
 */
export default function AddPost({ fetchAllPosts }) {
  // --- Context & Global State ---
  const { profileData, isLoadingProfile } = useContext(ProfileContext);

  // --- Local States ---
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("public");
  
  // Image handling states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // UI toggles and loading states
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // --- Refs ---
  const fileInputRef = useRef(null);

  /**
   * Handles image selection from the file input.
   * Generates a local URL for previewing the image before upload.
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /**
   * Clears the selected image and resets the file input value.
   */
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Appends the selected emoji to the current text content.
   */
  const handleEmojiClick = (emojiObject) => {
    setContent((prevContent) => prevContent + emojiObject.emoji);
  };

  /**
   * Submits the post data (text, image, privacy) to the backend API.
   */
  const handlePostSubmit = async () => {
    // Prevent empty submissions
    if (!content.trim() && !imageFile) {
      toast.warning("Please write something or add a photo.");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare payload
      const formData = new FormData();
      if (content.trim()) formData.append("body", content);
      formData.append("privacy", privacy);
      if (imageFile) formData.append("image", imageFile);

      // API Call
      await createPost(formData);
      toast.success("Post published successfully!");

      // Reset form states upon success
      setContent("");
      removeImage();
      setShowEmojiPicker(false);
      
      // Refresh the feed
      if (fetchAllPosts) fetchAllPosts();

    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to publish post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Disable submit button if form is empty or currently uploading
  const isSubmitDisabled = (!content.trim() && !imageFile) || isLoading;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md">
      
      {/* --- Header: User Info & Privacy Settings --- */}
      <div className="mb-3 flex items-start gap-3">
        {isLoadingProfile ? (
          <Skeleton className="h-11 w-11 rounded-full" />
        ) : (
          <img
            src={profileData?.photo || avatar}
            alt={profileData?.name || "User"}
            className="h-11 w-11 rounded-full object-cover border border-slate-100"
          />
        )}

        <div className="flex-1">
          {isLoadingProfile ? (
            <Skeleton className="mt-1 mb-2 h-5 w-32 rounded-lg" />
          ) : (
            <p className="text-base font-extrabold text-slate-900">
              {profileData?.name || "User"}
            </p>
          )}
          
          <div className="mt-1 flex items-center">
            <Select
              aria-label="Post Privacy"
              defaultSelectedKeys={["public"]}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-33.5"
              size="sm"
              variant="flat"
            >
              <SelectItem key="public" startContent={<LuEarth className="text-slate-500" />}>
                Public
              </SelectItem>
              <SelectItem key="followers" startContent={<LuUsers className="text-slate-500" />}>
                Followers
              </SelectItem>
              <SelectItem key="only me" startContent={<LuLock className="text-slate-500" />}>
                Only me
              </SelectItem>
            </Select>
          </div>
        </div>
      </div>

      {/* --- Body: Text Content Input --- */}
      <div className="relative mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={imagePreview ? "2" : "3"}
          placeholder="What's on your mind?"
          className="w-full resize-none rounded-xl border-none bg-transparent px-2 py-2 text-[17px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-500"
        ></textarea>
      </div>

      {/* --- Body: Image Preview --- */}
      {imagePreview && (
        <div className="relative mb-3 rounded-xl border border-slate-200 p-2 bg-slate-50">
          <button
            onClick={removeImage}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/80 text-slate-700 shadow backdrop-blur-sm transition hover:bg-slate-200"
            title="Remove photo"
          >
            <LuX size={18} />
          </button>
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-80 w-full rounded-lg object-cover"
          />
        </div>
      )}

      {/* --- Footer: Actions & Submit Button --- */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="relative flex items-center gap-1">
          
          {/* Image Upload Button */}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
            <LuImage className="text-emerald-500 text-xl" />
            <span className="hidden sm:inline">Photo/video</span>
            <input
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              type="file"
              className="hidden"
            />
          </label>

          {/* Emoji Picker Toggle Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <LuSmile className="text-amber-500 text-xl" />
              <span className="hidden sm:inline">Feeling/activity</span>
            </button>

            {/* Emoji Picker Dropdown */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 z-50 mb-2 shadow-2xl rounded-2xl overflow-hidden">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  searchPlaceHolder="Search emojis..."
                  width={320}
                  height={400}
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePostSubmit}
            disabled={isSubmitDisabled}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#1877f2] px-6 py-2 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                Posting... <FaSpinner className="animate-spin" />
              </>
            ) : (
              <>
                Post <LuSend />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}