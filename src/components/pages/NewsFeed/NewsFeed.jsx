import React, { useEffect, useState } from "react";
import Post from "../Post/Post";
import { getAllPosts } from "../../../services/postService";
import MobileNav from "../../MobileNav/MobileNav";
import PostSkeletons from "../../Skeletons/PostSkeletons";
import AddPost from "../../AddPost/AddPost";

export default function NewsFeed() {

  const [posts, setPosts] = useState([])
      async function fetchAllPosts() {
      const response = await getAllPosts();
      console.log(response.data.posts);
      setPosts(response.data.posts);
    }
  useEffect(() => {

    fetchAllPosts();
  }, []);
  return (
    <>
      <section className="space-y-4">
        <MobileNav />
        <AddPost fetchAllPosts={fetchAllPosts} />
        {posts.length === 0 ? [...Array(10)].map((_, i) => <PostSkeletons key={i} />) : posts.map((post) => 
          <Post key={post.id} post={post} />
        )}

      </section>
    </>
  );
}
