import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import TypeIt from "typeit-react";
import "./preloader.css";

const Preloader = () => {

  let removePreLoader = () => {

     document.getElementsByClassName("preload")[0].style.display = "none"
     document.getElementsByClassName("mainDiv")[0].style.display = "inline"
  }

  useEffect(() => {
  })

  return(
    <div id="preloaderSection">
      <TypeIt options={{
          strings: ["Brian Todd"],
          lifeLike: true,
          speed: 90,
          cursorChar: "&#128123",
          cursor: {
            autoPause: false,
            animation: {
              options: {
                duration: 1000,
                easing: "linear",
                direction: "alternate",
              },
              frames: [
                {
                  transformOrigin: "0.575em 0.7em",
                  transform: "rotate(0deg) scale(.5)",
                },
                {
                  transformOrigin: "0.575em 0.7em",
                  transform: "rotate(50deg) scale(3)",
                },
              ],
            }
          },
          afterComplete: function (instance) {
            instance.destroy();
          }
}}
       className="titleText"></TypeIt>
      <a className="startText" onClick={() => removePreLoader()}><p>Push Start Button</p></a>
      <div id="copyright">
      <p className="regText">&reg; 1991 BRBK Creative Group, INC</p>
      <p className="liscensedText">Licensed Exclusively</p>
      </div>
      <Outlet />
    </div>
  )

}

export default Preloader;
