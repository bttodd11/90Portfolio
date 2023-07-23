import {React} from "react";
import headshot from "../../img/pixelCharacter.png";
import "./main.css";



const Main = () => {

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
          <p>Experience: <span> 7 yrs</span></p>
        </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Main;
