import React from "react";
import "./skills.css";


let skills = () => {

  return (
    <div id="skillSection">
      <h2 className="skillTitle">Tech Savvy</h2>
      <div class="container-fluid">
        <div class="row">
          <div class="col-sm-6 col-md-6 col-lg-6 skillList">
            <h2 className="skillHeader">Languages</h2>
            <p>JavaScript: 7yrs</p>
            <p>Java: 3yrs</p>
            <p>TypeScript: 1yr</p>
            <p>GraphQL: 1yr</p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 skillList">
            <h2 className="skillHeader">Frameworks</h2>
            <p>ReactJS: 5yrs</p>
            <p>AngularJS: 5yrs</p>
            <p>Bootstrap: 7yrs</p>
            <p>Jest: 1yr</p>
          </div>
        </div>
      </div>

    </div>
  )

}

export default skills;
