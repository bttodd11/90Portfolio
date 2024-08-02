import {React, useEffect, useRef} from "react";
import "./skills.css";
import {CountUp} from "countup.js";


let Skills = () => {
  // Start at 0 and have a count effect 
  let yearNow = new Date().getFullYear()
  let startNumber = 0;
  let jsYear = 2014;
  let javaYear = 2019;
  let tsYear = 2021;
  let graphqlYear = 2021 
  let reactYear = 2016
  let angularYear = 2018
  let bootstrapYear = 2016
  let jestYear = 2022
  const countupRef = useRef(null);
  let countUpAnim;



    useEffect(() => {
      
      initCountUp();
    },[])

    let initCountUp = async () => {
      countUpAnim = new CountUp(countupRef.current, 1000);
      if (!countUpAnim.error) {
        countUpAnim.start();
      } else {
        console.error(countUpAnim.error);
      }
    }

  return ( 
    <div id="skillSection">
      <h2 className="skillTitle">Tech Savvy</h2>
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-6 skillList">
            <h2 className="skillHeader">Languages</h2>
            <div className="spacer">
            <p style={{display:"inline"}}>JavaScript </p><p className="count" ref={countupRef}>0</p><p style={{display:"inline"}}> yrs</p>
            </div>
            {/* <div className="spacer">
            <p style={{display:"inline"}}>Java </p><p className="count" data-target={yearNow - javaYear}>0</p><p style={{display: "inline"}}> yrs</p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>TypeScript </p><p className="count" data-target={yearNow - tsYear}>0</p><p style={{display:"inline"}}> yrs</p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>GraphQL </p><p className="count" data-target={yearNow - graphqlYear}>0</p><p style={{display:"inline"}}> yrs</p>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-6 skillList">
            <h2 className="skillHeader">Frameworks</h2>
            <div className="spacer">
            <p style={{display:"inline"}}>React </p><p className="count" data-target={yearNow - reactYear}>0</p><p style={{display:"inline"}}> yrs</p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>Angular </p><p className="count" data-target={yearNow - angularYear}>0</p><p style={{display:"inline"}}> yrs</p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>Bootstrap </p><p className="count" data-target={yearNow - bootstrapYear}>0</p><p style={{display:"inline"}}> yrs</p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>Jest </p><p className="count" data-target={yearNow - jestYear}>0</p><p style={{display:"inline"}}> yrs</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skills;
