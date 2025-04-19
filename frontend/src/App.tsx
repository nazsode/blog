import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PostList from "./components/PostList";
import PostForm from "./components/PostForm";
import PostDetail from "./components/PostDetail";
import { Post } from "./types";

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:8080/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  return (
    <Router>
      <div className="container mx-auto px-4">
        <nav className="py-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
            Home
          </Link>
          <Link to="/create" className="text-blue-600 hover:text-blue-800">
            Create Post
          </Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={<PostList posts={posts} refreshPosts={fetchPosts} />}
          />
          <Route
            path="/create"
            element={<PostForm refreshPosts={fetchPosts} />}
          />
          <Route
            path="/posts/:id"
            element={<PostDetail refreshPosts={fetchPosts} />}
          />
          <Route
            path="/edit/:id"
            element={<PostForm refreshPosts={fetchPosts} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
