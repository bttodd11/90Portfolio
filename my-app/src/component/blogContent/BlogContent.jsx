import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Links from "../nav/nav";
import "../blogContent/BlogContent.css";

const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const BlogContent = ({ post }) => {
  let postContent = useLocation().state

 useEffect(()=> { 
  // Just wanted a rerender on passed content
 },[postContent])

  

  return (      
    <div className='BlogContentSection'>
  <Links />
    <article>
      <h1 className='blogContentTitle'>
        {postContent.fields.title}
      </h1>
      <p className='blogContentDate'>
        <em>{formatDate(postContent.fields.date)}</em>
      </p>
      <div className='blogContentContent'>
        {postContent.fields.content}
      </div>
    </article>
    </div>
  );
};

export default BlogContent;