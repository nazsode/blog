import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Post } from "../types";
import { useState, useEffect } from "react";

interface PostDetailProps {
  refreshPosts: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ refreshPosts }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:8080/posts/${id}`);
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:8080/posts/${id}`, {
        method: "DELETE",
      });
      refreshPosts();
      navigate("/");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          &larr; Back to posts
        </Link>
      </div>

      {post.image && (
        <img
          src={`http://localhost:8080${post.image}`}
          alt={post.title}
          className="w-full h-64 object-cover mb-6 rounded"
        />
      )}

      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 mb-6">
        Posted on {new Date(post.created_at).toLocaleDateString()}
      </p>

      <div className="prose max-w-none mb-8">
        <p>{post.content}</p>
      </div>

      <div className="flex space-x-4">
        <Link
          to={`/edit/${post.id}`}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default PostDetail;
