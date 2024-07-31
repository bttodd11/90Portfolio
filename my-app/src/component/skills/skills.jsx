import {React, useEffect} from "react";
import "./skills.css";


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


    useEffect(() => {
      const counters = document.querySelectorAll('.count');
      const speed = 1;

    
    
      counters.forEach((counter) => {
        const updateCount = () => {
          const target = parseInt(counter.getAttribute('data-target'));
          const count = parseInt(counter.innerText);
          const increment = Math.trunc(target / speed);
          console.log(increment)
          if (count < target) {
            counter.innerText = count + increment;
            setTimeout(updateCount, 1);
          } else {
            counter.innerText = target;
          }
        }
         updateCount();
      });
    })

  return (
    <div id="skillSection">
      <h2 className="skillTitle">Tech Savvy</h2>
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-6 skillList">
            <h2 className="skillHeader">Languages</h2>
            <p className="count" data-target={yearNow - jsYear}>0</p>
            <p className="count" data-target={yearNow - javaYear}>0</p>
            {/* <p className="count" data-target={yearNow - tsYear}>0</p>
            <p className="count" data-target={yearNow - graphqlYear}>0</p>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-6 skillList">
            <h2 className="skillHeader">Frameworks</h2>
            <p className="count" data-target={yearNow - reactYear}>0</p>
            <p className="count" data-target={yearNow - angularYear}>0</p>
            <p className="count" data-target={yearNow - bootstrapYear}>0</p>
            <p className="count" data-target={yearNow - jestYear}>0</p> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skills;
