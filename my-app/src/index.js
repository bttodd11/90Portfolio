import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Routes } from "react-router-dom";
import Main from "./component/main/main";
import App from './App';
import './index.css';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HashRouter>
    <Routes>
    <Route path="/" element={<App />} />
    <Route path="main" element={<Main />}/>
    </Routes>
    </HashRouter>
  </React.StrictMode>,
);

