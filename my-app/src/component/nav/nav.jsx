import "./nav.css";
import React, { useState } from "react";
import Nav from "react-bootstrap/Nav";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const BLOG_PASSWORD = process.env.REACT_APP_BLOG_PASSWORD;

const Links = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleBlogClick = (event) => {
    event.preventDefault();
    setPassword("");
    setError("");
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (password === BLOG_PASSWORD) {
      setShowPasswordModal(false);
      setPassword("");
      setError("");
      navigate("/blog");
      return;
    }

    setError("Incorrect password");
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPassword("");
    setError("");
  };

  if (location.pathname === "/blog") {
    return (
      <div className="navSection">
        <Nav className="justify-content-center navLinks">
          <Nav.Item>
            <Link className="navLink" to="/main">Back</Link>
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
          <button
            type="button"
            className="navLink navButtonLink"
            onClick={handleBlogClick}
          >
            Chronicles
          </button>
        </Nav.Item>
        <Nav.Item>
          <a className="navLink"><HashLink smooth to="#contactSection">Contact</HashLink></a>
        </Nav.Item>
      </Nav>

      {showPasswordModal && (
        <div className="navPasswordOverlay" onClick={closePasswordModal}>
          <div
            className="navPasswordModal"
            onClick={(event) => event.stopPropagation()}
          >
            <h4 className="navPasswordHeader">Protected page</h4>

            <form className="navPasswordForm" onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoFocus
                className="navPasswordInput"
              />

              {error && (
                <div className="navPasswordError">
                  {error}
                </div>
              )}

              <div className="navPasswordActions">
                <button type="submit" className="navPasswordButton">
                  Open
                </button>
                <button
                  type="button"
                  className="navPasswordCancelButton"
                  onClick={closePasswordModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Links;