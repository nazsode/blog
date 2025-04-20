import React from "react";
import { Link } from "react-router-dom";
import { Post } from "../types";

interface PostListProps {
  posts: Post[];
  refreshPosts: () => void;
}

const PostList: React.FC<PostListProps> = ({ posts, refreshPosts }) => {
  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:8080/posts/${id}`, {
        method: "DELETE",
      });
      refreshPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center">Blog Posts</h1>
      <div className="grid max-w-3xl mx-auto">
        {posts.map((post) => (
          <div
            key={post.id}
            className="my-4 border border-black border-2 p-6 m-8 rounded-xl shadow-[0_4px_0px_-1px_rgba(0,0,0,1)]"
          >
            {post.image && (
              <img
                src={`http://localhost:8080${post.image}`}
                alt={post.title}
                className="w-full h-48 object-cover mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">
              <Link to={`/posts/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
            <div className="flex space-x-2">
              <Link
                to={`/edit/${post.id}`}
                className="px-3 py-1 bg-white text-black rounded border border-2 border-black hover:bg-black hover:text-white"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post.id)}
                className="px-3 py-1 bg-white text-black rounded border border-2 border-black hover:bg-black hover:text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;
