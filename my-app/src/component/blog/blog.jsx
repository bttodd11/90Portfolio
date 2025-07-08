import "./blog.css";
import React, { useEffect, useState } from "react";
import BlogContent from '../blogContent/BlogContent';
import Links from "../nav/nav"
import { createClient } from 'contentful';


let Blogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let getAllBlogs = async () => {
    const client = createClient({
      space: 'qj0fqcd2205y',
      environment: 'master',
      accessToken: 'a9upziXUL7zbuCyO2TftQ5Pa_0a_VUopskBY2mdHLnE'
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
    let blogPost = getAllBlogs();
    blogPost.then((data) => {
      setPosts(data);
      console.log(posts)
      setLoading(false);
    }).catch((err) => {
      setError(err);
      setLoading(false);
    });
  }, []);


  return (
    <div id="blogSection">
      <Links />
      <div className="container-fluid">
        <div className="row">
          {posts.map((post, idx) => (
            <div key={post.id || idx} className="col-sm-12 col-md-4 col-lg-4">
              <div className="blog-post">
                <h2 className="blogTitle">{post.fields.title}</h2>
                <p className="blogDate">{new Date(post.fields.date.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

}

export default Blogs;
