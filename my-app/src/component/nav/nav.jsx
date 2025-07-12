import "./nav.css";
import React from "react";
import Nav from 'react-bootstrap/Nav';
import { Link, useLocation } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';



const Links = () => {
  const location = useLocation();

    if (location.pathname === "/blog") {
    return (
      <div className="navSection">
        <Nav className="justify-content-center navLinks">
          <Nav.Item>
            <Link className="navLink" to="/main">Home</Link>
          </Nav.Item>
          <Nav.Item>
            <Link className="navLink" to="/blog">Back</Link>
          </Nav.Item>
        </Nav>
      </div>
    );
  }
  if (location.pathname === "/blogContent") {
    return (
      <div className="navSection">
        <Nav className="justify-content-center navLinks">
          <Nav.Item>
            <Link className="navLink" to="/blog">Back</Link>
          </Nav.Item>
        </Nav>
      </div>
    );
  }

  return (
    <div className="navSection">
      <Nav className="justify-content-center navLinks">
        <Nav.Item>
          <a className="navLink"><HashLink smooth to="#skillSection">Tech</HashLink></a>
        </Nav.Item>
        <Nav.Item>
          <a className="navLink"><HashLink smooth to="#workSection">Work</HashLink></a>
        </Nav.Item>
        <Nav.Item>
          <a className="navLink"><HashLink smooth to="#statSection">Stats</HashLink></a>
        </Nav.Item>
        <Nav.Item>
          <a className="navLink" href="https://bttodd.myportfolio.com/" target="_blank">Photography</a>
        </Nav.Item>
        <Nav.Item>
          <Link className="navLink" to="/blog">Chronicles</Link>
        </Nav.Item>
        <Nav.Item>
          <a className="navLink"><HashLink smooth to="#contactSection">Contact</HashLink></a>
        </Nav.Item>
      </Nav>
    </div>
  );
}

export default Links;
