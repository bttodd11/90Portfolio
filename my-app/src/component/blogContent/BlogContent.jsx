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
  let postContent = useLocation().state;

  useEffect(() => {
    // Just wanted a rerender on passed content
    console.log(postContent)
  }, [postContent]);

  return (
    <div className='BlogContentSection'>
      <Links />
      <article>
        <h1 className='blogContentTitle'>
          {postContent.fields.title}
        </h1>
        {postContent.fields.quote && (
          <blockquote className='blogContentQuote'>
            {'" ' + postContent.fields.quote + ' "'}
          </blockquote>
        )}
        <p className='blogContentDate'>
          <em>{formatDate(postContent.fields.date)}</em>
        </p>
        <div className='blogContentContent' style={{ position: 'relative', lineHeight: '2' }}>
          {postContent.fields.media && (
            <img
              src={postContent.fields.media.fields.file.url}
              alt={postContent.fields.title}
              className='blogContentImage'
            />
          )}
          <span className="blogContentText" style={{ display: 'block', textAlign: 'justify' }}>
            {postContent.fields.content}
          </span>
        </div>
      </article>
    </div>
  );
};

export default BlogContent;