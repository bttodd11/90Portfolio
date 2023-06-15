import "./nav.css";
import React from "react";
import Nav from 'react-bootstrap/Nav';


const links = () => {

  return (
  <div className="navSection">
      <Nav defaultActiveKey="/home" as="ul" className="justify-content-center">
      <Nav.Item as="li">
        <Nav.Link href="/home">Tech</Nav.Link>
      </Nav.Item>
      <Nav.Item as="li">
        <Nav.Link eventKey="link-1">Photography</Nav.Link>
      </Nav.Item>
      <Nav.Item as="li">
        <Nav.Link eventKey="link-2">Contact</Nav.Link>
      </Nav.Item>
    </Nav>
</div>
  );
}

export default links;
