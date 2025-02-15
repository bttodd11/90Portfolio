import { React } from "react";
import "./work.css";

let Work = () => {

    return (
        <div id="workSection">
            <h2 className="workTitle">Work</h2>
            <div className="container-fluid">
                <div>
                    <p className="workDescription">Currently working at <span id="homeDepot"> The Home Depot </span> where I support stakeholders by delivering creative and functional solutions. My responsibilities include maintaining and optimizing the Java-based API that powers multiple web pages, developing new features within our CMS using React to create responsive and user-friendly applications, and integrating analytics into components to track valuable user interactions and drive data-informed improvements.</p>
                </div>

            </div>
        </div>
    )
}

export default Work;