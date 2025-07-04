import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import TypeIt from "typeit-react";
import "./preloader.css";

const Preloader = () => {



  useEffect(() => {
  })

  return(
    <div id="preloaderSection">
      <TypeIt options={{
          strings: ["Brian Todd"],
          lifeLike: true,
          speed: 90,
}}

       className="titleText"></TypeIt>
      <Link className="startText" to="/main"><p>Push Start Button</p></Link>
      <div id="copyright">
      <p className="regText">&reg; 1991 BRBK Creative Group, INC</p>
      <p className="liscensedText">Licensed Exclusively</p>
      </div>
      <Outlet />
    </div>
  )

}

export default Preloader;
