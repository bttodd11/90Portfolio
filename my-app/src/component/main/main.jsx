import {React, useEffect} from "react";
import headshot from "../../img/pixelCharacter.png";
import "./main.css";
import {CountUp} from "countup.js";




let Main = () => {
  let yearNow = new Date().getFullYear()
  let experience = 2014;
  let countUpAnim8;


  useEffect(() => {
    initCountUp();
  },[])

  let initCountUp = async () => {

    countUpAnim8 = new CountUp('experience', yearNow - experience, {enableScrollSpy: true, duration: 5, suffix:" yrs"});

    if (!countUpAnim8.error) {
      countUpAnim8.start();
    } else {
      console.error(countUpAnim8.error);
    }
  }

  return (
    <div className="mainSection">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-6 imageDiv">
            <img src={headshot} className="imageHeadshot" />
          </div>
          <div className="col-sm-12 col-md-6 col-lg-6">
        <div className="infoDiv">
          <p className="name"> <span className="arrow">&#10148;</span> Player: <span className="myName"> Brian Todd</span></p>
          <p>Location: <span> South Austin,Texas</span></p>
          <p>Occupation: <span> Software Engineer</span></p>
          <p>Experience: <span id="experience">0</span></p>
        </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Main;
