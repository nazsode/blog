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

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      alert("Image file size should be less than 5MB");
      return;
    }

    // EK ÇÖZÜM 2: Dosya tipi kontrolü (sadece resim)
    if (imageFile && !imageFile.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Basit validasyon
    if (!post.title.trim() || !post.content.trim()) {
      alert("Please fill in both title and content fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", post.title);
      formData.append("content", post.content);

      // Sadece imageFile varsa ekle
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = id
        ? `http://localhost:8080/posts/${id}`
        : "http://localhost:8080/posts";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData?.error || "Failed to save post");
      }

      refreshPosts();
      navigate("/");
    } catch (error) {
      let errorMessage = "An error occurred while saving the post";

      if (error instanceof Error) {
        // Dosya yükleme hatasını özel olarak ele al
        if (error.message.includes("Error retrieving the file")) {
          errorMessage = "Post saved without image (image upload failed)";
        } else {
          errorMessage = error.message;
        }
      }

      console.error("Error saving post:", errorMessage);
      alert(errorMessage);
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
          className="px-4 py-2 bg-white text-black border border-3 border-black rounded hover:bg-black hover:text-white"
        >
          {id ? "Update Post" : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
