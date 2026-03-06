import React, { useState, useContext, useEffect } from "react";

// --- Icons & UI ---
import {
  LuThumbsUp,
  LuRepeat2,
  LuMessageCircle,
  LuShare2,
  LuImage,
  LuSmile,
  LuSendHorizontal,
  LuX,
  LuEllipsis,
  LuPencil,
  LuTrash2
} from "react-icons/lu";
import { FaSpinner } from "react-icons/fa";
import Swal from 'sweetalert2';
import { toast } from "react-toastify";

// --- Services, Context & Helpers ---
import { ProfileContext } from "../../context/ProfileContext";
import { getAvatar } from "../lib/HelperFunctions/fn";
import avatar from "../../img/default-profile.png";

import { toggleLikePost, sharePost } from "../../services/postService"; 
import { 
  getAllComments, 
  createComment, 
  likeComment, 
  replyToComment,
  getCommentReplies,
  updateComment,
  deleteComment
} from "../../services/commentsService";

/**
 * PostFooter Component
 * Handles all user interactions with a post:
 * Likes, Shares, Comments, Replies, and their respective CRUD operations.
 * Uses Optimistic UI updates for a snappy user experience.
 */
export default function PostFooter({ post }) {
  // --- Global Context ---
  const { profileData } = useContext(ProfileContext);
  const myId = profileData?._id;

  // --- Post Stats States ---
  const [likes, setLikes] = useState(post?.likes || []);
  const [isLiked, setIsLiked] = useState(post?.likes?.some(user => user._id === myId));
  const [sharesCount, setSharesCount] = useState(post?.sharesCount || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(post?.commentsCount || 0);

  // --- Comments States ---
  const [comments, setComments] = useState([]);
  const [localTopComment, setLocalTopComment] = useState(post?.topComment);
  const [isLoading, setIsLoading] = useState(false);
  
  // New Comment Input
  const [commentBody, setCommentBody] = useState("");
  const [isLoadingNewComment, setIsLoadingNewComment] = useState(false);

  // --- Reply States ---
  const [replyingToId, setReplyingToId] = useState(null); 
  const [replyBody, setReplyBody] = useState("");
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [loadingRepliesId, setLoadingRepliesId] = useState(null);
  const [repliesToShow, setRepliesToShow] = useState({}); 

  // --- Edit/Delete Comment States ---
  const [editingId, setEditingId] = useState(null); 
  const [editValue, setEditValue] = useState(""); 
  const [openMenuId, setOpenMenuId] = useState(null); 

  // --- Share Modal States ---
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCaption, setShareCaption] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // Synchronize local states if post prop changes
  useEffect(() => {
    setLocalCommentsCount(post?.commentsCount || 0);
    setSharesCount(post?.sharesCount || 0);
    setLocalTopComment(post?.topComment);
    setLikes(post?.likes || []);
    setIsLiked(post?.likes?.some(user => user._id === myId));
  }, [post, myId]);

  // ==============================
  // POST ACTIONS (Like, Share)
  // ==============================

  const handleLike = async () => { 
    if (!myId) return toast.warning("Please login.");
    
    // Optimistic Update
    setLikes(prev => isLiked ? prev.filter(u => u._id !== myId) : [...prev, { _id: myId }]);
    setIsLiked(!isLiked);
    
    try {
      await toggleLikePost(post._id || post.id);
    } catch (error) { 
      // Revert on failure
      setIsLiked(!isLiked); 
    }
  };

  const confirmShare = async () => { 
    try {
      setIsSharing(true); 
      await sharePost(post._id || post.id, shareCaption); 
      setSharesCount(prev => prev + 1); 
      toast.success("Post shared!");
      setIsShareModalOpen(false); 
      setShareCaption("");
    } catch (error) { 
      toast.error("Failed to share."); 
    } finally { 
      setIsSharing(false); 
    }
  };

  // ==============================
  // COMMENT ACTIONS (Fetch, Create, Like)
  // ==============================

  const fetchAllComments = async (postId) => {
    try {
      setIsLoading(true);
      const response = await getAllComments(postId);
      setComments(response.data?.comments || []);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (commentBody.trim().length < 2) return toast.warning("Comment is too short.");
    
    // 1. Optimistic UI insertion
    const newOptimisticComment = {
      _id: Date.now().toString(),
      content: commentBody,
      commentCreator: { _id: myId, name: profileData?.name || "Me", photo: profileData?.photo },
      createdAt: new Date().toISOString()
    };

    setComments(prev => [newOptimisticComment, ...prev]);
    setLocalCommentsCount(prev => prev + 1);
    setCommentBody("");

    // 2. Actual API Call
    try {
      setIsLoadingNewComment(true);
      const formData = new FormData(); 
      formData.append("content", newOptimisticComment.content);
      
      await createComment(postId, formData);
      fetchAllComments(postId); // Refresh to get real IDs
    } catch (error) { 
      toast.error("Failed to add comment."); 
    } finally { 
      setIsLoadingNewComment(false); 
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!myId) return toast.warning("Please login.");
    
    try {
      // Recursive function to toggle like in nested comments/replies
      const toggleLike = (item) => {
        if (item._id === commentId) {
          const isItemLiked = item.likes?.some(u => u._id === myId);
          return { 
            ...item, 
            likes: isItemLiked 
              ? item.likes.filter(u => u._id !== myId) 
              : [...(item.likes || []), { _id: myId }] 
          };
        }
        if (item.replies) {
          return { ...item, replies: item.replies.map(toggleLike) };
        }
        return item;
      };

      setLocalTopComment(prev => prev ? toggleLike(prev) : prev);
      setComments(prev => prev.map(toggleLike));
      await likeComment(post._id || post.id, commentId);
    } catch (error) { 
      console.error(error); 
    }
  };

  // ==============================
  // REPLY ACTIONS (Submit, Toggle)
  // ==============================

  const handleReplySubmit = async (commentId) => {
    if (replyBody.trim().length < 2) return toast.warning("Reply is too short.");
    
    const textToSubmit = replyBody;
    setReplyBody(""); 
    setReplyingToId(null); 
    setExpandedReplies(prev => ({ ...prev, [commentId]: true })); 

    // Optimistic Reply
    const newOptimisticReply = {
      _id: Date.now().toString(),
      content: textToSubmit,
      commentCreator: { _id: myId, name: profileData?.name || "Me", photo: profileData?.photo },
      createdAt: new Date().toISOString()
    };

    setComments(prev => prev.map(c => 
      c._id === commentId 
        ? { ...c, replies: [...(c.replies || []), newOptimisticReply] } 
        : c
    ));

    if (localTopComment?._id === commentId) {
      setLocalTopComment(prev => ({ 
        ...prev, 
        replies: [...(prev.replies || []), newOptimisticReply] 
      }));
    }
    
    setRepliesToShow(prev => ({ ...prev, [commentId]: (prev[commentId] || 2) + 1 }));

    try {
      setIsLoadingReply(true);
      const formData = new FormData(); 
      formData.append("content", textToSubmit);
      await replyToComment(post._id || post.id, commentId, formData);
      toggleRepliesVisibility(commentId, true); // Refresh replies from server
    } catch (error) { 
      toast.error("Failed to add reply."); 
    } finally { 
      setIsLoadingReply(false); 
    }
  };

  const toggleRepliesVisibility = async (commentId, forceFetch = false) => {
    // Collapse if already expanded and not forced to fetch
    if (expandedReplies[commentId] && !forceFetch) {
      setExpandedReplies(prev => ({ ...prev, [commentId]: false }));
      return;
    }

    setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
    setLoadingRepliesId(commentId);
    
    try {
      const response = await getCommentReplies(post._id || post.id, commentId);
      let fetchedReplies = response.data?.comments || response.data?.replies || response.data || [];
      if (!Array.isArray(fetchedReplies)) fetchedReplies = [];

      setComments(prev => prev.map(c => 
        c._id === commentId ? { ...c, replies: fetchedReplies } : c
      ));
      
      if (!forceFetch) {
        setRepliesToShow(prev => ({ ...prev, [commentId]: 2 }));
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoadingRepliesId(null); 
    }
  };

  // ==============================
  // EDIT & DELETE ACTIONS
  // ==============================

  const submitEdit = async (commentId) => {
    if (!editValue.trim()) return toast.warning("Cannot be empty");
    
    const newContent = editValue;
    setEditingId(null);

    // Update text optimistically
    const updateText = (item) => {
      if (item._id === commentId) return { ...item, content: newContent };
      if (item.replies) return { ...item, replies: item.replies.map(updateText) };
      return item;
    };

    setLocalTopComment(prev => prev ? updateText(prev) : prev);
    setComments(prev => prev.map(updateText));

    try {
      const formData = new FormData(); 
      formData.append("content", newContent);
      await updateComment(post._id || post.id, commentId, formData);
      toast.success("Updated successfully");
    } catch (error) { 
      toast.error("Failed to update."); 
    }
  };

  const submitDelete = async (commentId) => {
    setOpenMenuId(null);
    
    const result = await Swal.fire({
      title: 'Delete this comment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      // Optimistic delete
      setComments(prev => prev.filter(c => c._id !== commentId));
      if (localTopComment?._id === commentId) setLocalTopComment(null);
      setLocalCommentsCount(prev => prev - 1);

      try {
        await deleteComment(post._id || post.id, commentId);
        toast.success("Deleted!");
      } catch (error) { 
        toast.error("Failed to delete."); 
      }
    }
  };

  // Filter out the top comment so it doesn't duplicate in the list
  const otherComments = comments.filter((comment) => comment._id !== localTopComment?._id);

  // ==============================
  // SUB-COMPONENT: CommentItem
  // ==============================
  const CommentItem = ({ comment, isReply = false }) => {
    const isCommentLiked = comment.likes?.some(u => u._id === myId);
    const hasReplies = comment.repliesCount > 0 || (comment.replies && comment.replies.length > 0);
    const isExpanded = expandedReplies[comment._id];
    const isMyComment = comment.commentCreator?._id === myId;
    const isEditingThis = editingId === comment._id;
    
    const currentRepliesCount = repliesToShow[comment._id] || 2;
    const visibleReplies = comment.replies?.slice(0, currentRepliesCount) || [];
    const totalReplies = comment.replies?.length || 0;

    return (
      <div className={`flex items-start gap-2 ${isReply ? 'mt-2' : 'mt-4'}`}>
        <img
          src={getAvatar(comment.commentCreator?.photo)}
          alt={comment.commentCreator?.name}
          className={`${isReply ? 'mt-1 h-6 w-6' : 'h-8 w-8'} rounded-full border border-slate-100 object-cover`}
        />
        
        <div className="min-w-0 flex-1">
          {/* --- Edit Mode UI --- */}
          {isEditingThis ? (
            <div className="w-full rounded-2xl border border-[#1877f2] bg-white px-3 py-2 shadow-sm">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full resize-none bg-transparent text-sm text-slate-800 outline-none"
                rows="2"
                autoFocus
              />
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => setEditingId(null)} className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button onClick={() => submitEdit(comment._id)} className="cursor-pointer rounded bg-[#1877f2] px-3 py-1 text-xs font-bold text-white hover:bg-[#166fe5]">Save</button>
              </div>
            </div>
          ) : (
            
            /* --- Display Mode UI --- */
            <div className="relative flex items-center gap-2">
              <div className="group relative inline-block max-w-[85%] rounded-2xl bg-[#f0f2f5] px-3 py-2">
                <p className={`${isReply ? 'text-[11px]' : 'text-xs'} font-bold text-slate-900`}>
                  {comment.commentCreator?.name}
                </p>
                <p className={`${isReply ? 'text-xs' : 'text-sm'} mt-0.5 whitespace-pre-wrap text-slate-800`}>
                  {comment.content}
                </p>
              </div>

              {/* Edit/Delete Menu (Only for top-level comments authored by user) */}
              {isMyComment && !isReply && (
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === comment._id ? null : comment._id)} 
                    className="cursor-pointer rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <LuEllipsis size={14} />
                  </button>
                  
                  {openMenuId === comment._id && (
                    <div className="absolute left-full top-0 z-20 ml-1 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                      <button 
                        onClick={() => { setEditingId(comment._id); setEditValue(comment.content); setOpenMenuId(null); }}
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <LuPencil size={12}/> Edit
                      </button>
                      <button 
                        onClick={() => submitDelete(comment._id)}
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LuTrash2 size={12}/> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- Comment Actions (Time, Like, Reply) --- */}
          <div className="mt-1 flex items-center gap-3 px-2">
            <span className="text-[11px] font-semibold text-slate-500">
              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleLikeComment(comment._id)} 
                className={`cursor-pointer text-[11px] font-bold transition hover:underline ${isCommentLiked ? "text-[#1877f2]" : "text-slate-500 hover:text-slate-700"}`}
              >
                Like
              </button>
              
              {comment.likes?.length > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5" title={`${comment.likes.length} likes`}>
                  <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#1877f2] text-[8px] text-white"><LuThumbsUp className="fill-white" /></span>
                  <span className="text-[10px] font-bold text-slate-600">{comment.likes.length}</span>
                </div>
              )}
            </div>

            {!isReply && (
              <button 
                onClick={() => { setReplyingToId(replyingToId === comment._id ? null : comment._id); setReplyBody(""); }} 
                className="cursor-pointer text-[11px] font-bold text-slate-500 transition hover:text-slate-700 hover:underline"
              >
                Reply
              </button>
            )}
            
            {!isReply && hasReplies && (
              <button 
                onClick={() => toggleRepliesVisibility(comment._id)} 
                className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-slate-500 transition hover:underline"
              >
                {loadingRepliesId === comment._id && <FaSpinner className="animate-spin" />}
                {isExpanded ? "Hide replies" : `View replies`}
              </button>
            )}
          </div>

          {/* --- Reply Input Box --- */}
          {replyingToId === comment._id && !isReply && (
            <div className="mt-2 flex items-start gap-2">
              <img src={getAvatar(profileData?.photo)} alt="You" className="mt-1 h-6 w-6 rounded-full object-cover" />
              <div className="flex flex-1 items-center rounded-2xl border border-slate-200 bg-white px-3 py-1.5 focus-within:border-[#1877f2]">
                <input 
                  type="text" 
                  value={replyBody} 
                  onChange={(e) => setReplyBody(e.target.value)} 
                  placeholder={`Replying to ${comment.commentCreator?.name}...`} 
                  className="w-full bg-transparent text-xs text-slate-800 outline-none" 
                  autoFocus 
                />
                <button 
                  onClick={() => handleReplySubmit(comment._id)} 
                  disabled={!replyBody.trim() || isLoadingReply} 
                  className="ml-2 cursor-pointer rounded-full bg-slate-100 p-1 text-[#1877f2] transition hover:bg-slate-200 disabled:opacity-50"
                >
                  {isLoadingReply ? <FaSpinner className="animate-spin text-xs" /> : <LuSendHorizontal size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* --- Render Nested Replies --- */}
          {isExpanded && visibleReplies.length > 0 && !isReply && (
            <div className="mt-2 border-l-2 border-slate-200 pl-3">
              {visibleReplies.map(reply => (
                <CommentItem key={reply._id} comment={reply} isReply={true} />
              ))}
              
              {totalReplies > currentRepliesCount && (
                <button 
                  onClick={() => setRepliesToShow(prev => ({ ...prev, [comment._id]: currentRepliesCount + 2 }))}
                  className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:underline"
                >
                  <LuRepeat2 size={12}/> View more replies ({totalReplies - currentRepliesCount})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* --- Post Counters (Likes, Comments, Shares) --- */}
      <div className="px-4 pb-2 pt-3 text-sm text-slate-500">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1877f2] text-white">
              <LuThumbsUp />
            </span>
            <button type="button" className="cursor-default font-semibold transition">
              {likes.length || 0} likes
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
            <span className="inline-flex items-center gap-1"><LuRepeat2 /> {sharesCount} shares</span>
            <span>{localCommentsCount} comments</span>
          </div>
        </div>
      </div>

      <div className="mx-4 border-t border-slate-200"></div>

      {/* --- Post Actions Bar (Like, Comment, Share) --- */}
      <div className="grid grid-cols-3 gap-1 p-1">
        <button 
          onClick={handleLike} 
          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors hover:bg-slate-100 sm:gap-2 sm:text-sm ${isLiked ? "text-[#1877f2]" : "text-slate-600"}`}
        >
          <LuThumbsUp className={isLiked ? "fill-[#1877f2]" : ""} /><span>Like</span>
        </button>
        
        <button 
          onClick={() => fetchAllComments(post.id || post._id)} 
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 sm:gap-2 sm:text-sm"
        >
          {isLoading ? <FaSpinner className="animate-spin text-[#1877f2]" /> : <LuMessageCircle />}<span>Comment</span>
        </button>
        
        <button 
          onClick={() => { if (!myId) return toast.warning("Please login."); setIsShareModalOpen(true); }} 
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 sm:gap-2 sm:text-sm"
        >
          <LuShare2 /><span>Share</span>
        </button>
      </div>

      {/* --- Comments Section --- */}
      <div className="border-t border-slate-200 bg-[#f7f8fa] px-4 py-4">
        
        {/* Render Top Comment and Other Comments */}
        {localTopComment && <CommentItem comment={localTopComment} />}
        {otherComments.map((comment) => <CommentItem key={comment._id} comment={comment} />)}

        {/* New Comment Input Box */}
        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="flex items-start gap-2">
            <img 
              src={profileData?.photo ? getAvatar(profileData.photo) : avatar} 
              alt="You" 
              className="h-9 w-9 rounded-full object-cover" 
            />
            <div className="w-full rounded-2xl border border-slate-200 bg-[#f0f2f5] px-3 py-2 transition-colors focus-within:border-[#1877f2] focus-within:bg-white">
              <input 
                type="text" 
                value={commentBody} 
                onChange={(e) => setCommentBody(e.target.value)} 
                placeholder="Write a comment..." 
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500" 
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <LuImage className="cursor-pointer hover:text-slate-700" size={18} />
                  <LuSmile className="cursor-pointer hover:text-slate-700" size={18} />
                </div>
                <button 
                  onClick={() => handleCommentSubmit(post._id || post.id)} 
                  disabled={!commentBody.trim() || isLoadingNewComment} 
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#1877f2] text-white transition hover:bg-[#166fe5] disabled:opacity-50"
                >
                  {isLoadingNewComment ? <FaSpinner className="animate-spin" /> : <LuSendHorizontal size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Share Modal --- */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-extrabold text-slate-900">Share Post</h3>
              <button 
                onClick={() => setIsShareModalOpen(false)} 
                className="cursor-pointer rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
              >
                <LuX />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 flex items-start gap-3">
                <img 
                  src={getAvatar(profileData?.photo)} 
                  alt="You" 
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover" 
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{profileData?.name}</p>
                  <textarea 
                    value={shareCaption} 
                    onChange={(e) => setShareCaption(e.target.value)} 
                    placeholder="Say something about this..." 
                    className="mt-2 w-full resize-none bg-transparent text-slate-800 outline-none placeholder:text-slate-500" 
                    rows="3" 
                    autoFocus
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
              <button 
                onClick={() => setIsShareModalOpen(false)} 
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={confirmShare} 
                disabled={isSharing} 
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1877f2] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSharing ? <FaSpinner className="animate-spin" /> : <LuShare2 />} Share Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}