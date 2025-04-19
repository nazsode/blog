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
      <h1 className="text-2xl font-bold mb-6">Blog Posts</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded shadow">
            {post.image && (
              <img
                src={`http://localhost:8080${post.image}`}
                alt={post.title}
                className="w-full h-48 object-cover mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">
              <Link to={`/posts/${post.id}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
            <div className="flex space-x-2">
              <Link
                to={`/edit/${post.id}`}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
