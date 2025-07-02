import React, { useEffect, useState } from "react";

const BlogContent = ({ apiUrl }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) return <div>Loading blog posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {posts.map((post, idx) => (
        <div key={post.id || idx} className="blog-post">
          <h2>{post.title}</h2>
          <p>{post.body || post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default BlogContent;