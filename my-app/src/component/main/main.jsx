import {React} from "react";
import headshot from "../../img/pixelCharacter.png";
import "./main.css";



const Main = () => {

  return (
    <div className="mainSection">
      <div class="container-fluid">
        <div class="row">
          <div class="col-sm-12 col-md-6 col-lg-6 imageDiv">
            <img src={headshot} className="imageHeadshot" />
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6">
        <div className="infoDiv">
          <p className="name"> <span className="arrow">&#10148;</span> Player: <span> Brian Todd</span></p>
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
