import React from 'react';
import { HashRouter, Route, Routes } from "react-router-dom";
import Preloader from './component/preloader/preloader';
import Main from './component/main/main';
import Skills from './component/skills/skills';
import Contact from './component/contact/contact';
import Links from './component/nav/nav';
import Stats from './component/stats/stats';
import Work from './component/work/work';
import Blog from './component/blog/blog';
import './App.css';


function App() {

  return (
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route path="/" element ={<Preloader />} />
          <Route path="/main" element ={<Main />} />
          <Route path='/blog' element = {<Blog />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
}

export default App;
