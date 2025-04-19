import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Post } from "../types";

interface PostFormProps {
  refreshPosts: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ refreshPosts }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Omit<Post, "id" | "created_at">>({
    title: "",
    content: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:8080/posts/${id}`);
      const data = await response.json();
      setPost({
        title: data.title,
        content: data.content,
        image: data.image || "",
      });
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imagePath = post.image;

      // Upload new image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await fetch("http://localhost:8080/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        imagePath = uploadData.imagePath;
      }

      const postData = {
        title: post.title,
        content: post.content,
        image: imagePath,
      };

      const url = id
        ? `http://localhost:8080/posts/${id}`
        : "http://localhost:8080/posts";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        refreshPosts();
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Edit Post" : "Create New Post"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={post.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Content</label>
          <textarea
            name="content"
            value={post.content}
            onChange={handleInputChange}
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          {post.image && !imageFile && (
            <div className="mt-2">
              <img
                src={`http://localhost:8080${post.image}`}
                alt="Current"
                className="h-32 object-cover"
              />
              <p className="text-sm text-gray-500">Current image</p>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {id ? "Update Post" : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
