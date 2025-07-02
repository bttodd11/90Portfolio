import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Routes } from "react-router-dom";
import Main from "./component/main/main";

import Links from './component/nav/nav';
import Blogs from './component/blog/blog';
import Skills from './component/skills/skills';
import Contact from './component/contact/contact';
import Stats from './component/stats/stats';
import Work from './component/work/work';
import Preloader from './component/preloader/preloader';
import './App.css';
import './component/preloader/preloader.css'; 
import App from './App';
import './index.css';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HashRouter>
    <Routes>
              <Route path="/" element={
          <>
           <App />
          </>
        } />
        <Route path="/main" element={
          <>
            <Links />
            <Main />
            <Work />
            <Skills />
            <Stats />
            <Contact />
          </>
        } />
        <Route path="/blog" element={
          <>
            <Links />
            <Blogs />
          </>
        } />
    </Routes>
    </HashRouter>
  </React.StrictMode>,
);

