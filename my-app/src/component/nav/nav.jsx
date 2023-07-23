import "./nav.css";
import React from "react";
import Nav from 'react-bootstrap/Nav';
import { HashLink } from 'react-router-hash-link';



const links = () => {

  return (
    <div className="navSection">
      <Nav className="justify-content-center navLinks">
        <Nav.Item>
          <a className="navLink"><HashLink smooth to="#skillSection">Tech</HashLink></a>
        </Nav.Item>
        <Nav.Item>
          <a className="navLink"><HashLink smooth to="#statSection">Stats</HashLink></a>
        </Nav.Item>
        <Nav.Item>
          <a className="navLink" href="https://bttodd.myportfolio.com/" target="_blank">Photography</a>
        </Nav.Item>
        <Nav.Item>
          <a className="navLink"><HashLink smooth to="#contactSection">Contact</HashLink></a>
        </Nav.Item>
      </Nav>
    </div>
  );
}

export default links;
