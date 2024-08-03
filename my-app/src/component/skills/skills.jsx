import {React, useEffect} from "react";
import "./skills.css";
import {CountUp} from "countup.js";

let Skills = () => {
  // Start at 0 and have a count effect 
  let yearNow = new Date().getFullYear()
  let jsYear = 2014;
  let javaYear = 2019;
  let tsYear = 2021;
  let graphqlYear = 2021 
  let reactYear = 2016
  let angularYear = 2018
  let bootstrapYear = 2016
  let jestYear = 2022
  let countUpAnim;
  let countUpAnim1;
  let countUpAnim2
  let countUpAnim3
  let countUpAnim4
  let countUpAnim5
  let countUpAnim6
  let countUpAnim7


    useEffect(() => {
      initCountUp();
    },[])

    let initCountUp = async () => {

      countUpAnim = new CountUp('javaScript', yearNow - jsYear, {enableScrollSpy: true, duration: 2, suffix:" yrs"});
      countUpAnim1 = new CountUp('java', yearNow - javaYear, {enableScrollSpy: true, duration: 2, suffix:" yrs"});
      countUpAnim2 = new CountUp('typeScript', yearNow - tsYear, {enableScrollSpy: true, duration: 2, suffix:" yrs"} );
      countUpAnim3 = new CountUp('graphql', yearNow - graphqlYear, {enableScrollSpy:true, duration: 2, suffix:" yrs"});
      countUpAnim4 = new CountUp('react', yearNow - reactYear, {enableScrollSpy:true, duration: 2, suffix:" yrs"});
      countUpAnim5 = new CountUp('angular', yearNow - angularYear, {enableScrollSpy:true, duration: 2, suffix:" yrs"});
      countUpAnim6 = new CountUp('bootstrap', yearNow - bootstrapYear, {enableScrollSpy:true, duration: 2, suffix:" yrs"});
      countUpAnim7 = new CountUp('jest', yearNow - jestYear, {enableScrollSpy:true, duration: 2, suffix:" yrs"});
      if (!countUpAnim.error) {
        countUpAnim.start();
        countUpAnim1.start()
        countUpAnim2.start()
        countUpAnim3.start()
        countUpAnim4.start()
        countUpAnim5.start()
        countUpAnim6.start()
        countUpAnim7.start()
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
            <p style={{display:"inline"}}>JavaScript </p><p className="count" id="javaScript">0</p><p style={{display:"inline"}}></p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>Java </p><p className="count" id="java">0</p><p style={{display: "inline"}}></p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>TypeScript </p><p className="count" id="typeScript">0</p><p style={{display:"inline"}}></p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>GraphQL </p><p className="count" id="graphql">0</p><p style={{display:"inline"}}></p>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-6 skillList">
            <h2 className="skillHeader">Frameworks</h2>
            <div className="spacer">
            <p style={{display:"inline"}}>React </p><p className="count" id="react">0</p><p style={{display:"inline"}}></p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>Angular </p><p className="count" id="angular">0</p><p style={{display:"inline"}}></p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>Bootstrap </p><p className="count" id="bootstrap">0</p><p style={{display:"inline"}}></p>
            </div>
            <div className="spacer">
            <p style={{display:"inline"}}>Jest </p><p className="count" id="jest">0</p><p style={{display:"inline"}}></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skills;
