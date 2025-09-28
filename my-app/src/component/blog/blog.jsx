import "./blog.css";
import React, { useEffect, useState } from "react";
import BlogContent from '../blogContent/BlogContent';
import Links from "../nav/nav";
import { createClient } from 'contentful';
import { useNavigate, Routes, Route } from "react-router-dom";

let Blogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  let getAllBlogs = async () => {
    const client = createClient({
      space: process.env.REACT_APP_SPACE,
      environment: process.env.REACT_APP_ENV,
      accessToken: process.env.REACT_APP_ACCESS_TOKEN
    });

    try {
      const entry = await client.getEntries();
      setPosts(entry.items);
      setLoading(false);
      return entry.items;
    } catch (err) {
      setError(err);
      setLoading(false);
      return [];
    }
  };

  useEffect(() => {
    setLoading(true);
    getAllBlogs();
    // eslint-disable-next-line
  }, []);

  const handlePostClick = (post) => {
    console.log(post)
    navigate(`/blogContent`, {state: post });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading posts.</div>;

  return (
    <div id="blogSection">
      <Links />
      <div className="container-fluid">
        <div className="row">
          {posts.map((post, idx) => (
            <div
              key={post.sys?.id || idx}
              className="col-sm-12 col-md-4 col-lg-4"
              onClick={() => handlePostClick(post)}
              style={{ cursor: "pointer" }}
            >
              <div className="blog-post modern-blog-post">
                <h2 className="blogTitle modern-blog-title">{post.fields.title}</h2>
                <p className="blogDate modern-blog-date">
                  {new Date(post.fields.date?.createdAt || post.sys.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;
