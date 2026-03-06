import React from "react";
import PostHeader from "../../PostCard/PostHeader";
import PostBody from "../../PostCard/PostBody";
import PostFooter from "../../PostCard/PostFooter";

export default function Post({ post }) {
  if (!post) return null;

  return (
    <article className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
      <PostHeader post={post} />
      <PostBody post={post} />
      <PostFooter post={post} />
    </article>
  );
}