import React, { useContext } from "react";
import { NavLink, useNavigate } from 'react-router-dom';
import "../index.css";
import { Button } from "react-bootstrap";

const MyNavbar = () => {
  const navigate = useNavigate();
  const activeStyle = {
    color: 'white', 
    opacity: 1,
    border: '1px solid white',
    borderRadius: '5px',
    textDecoration: 'none'
  };

  const handleJump = () => {
    navigate(getSearchPath());
  }

  const getSearchPath = () => {
    const savedSymbol = localStorage.getItem('savedSymbol');
    console.log("32323232when change nav, savedsymbol: ", savedSymbol);
    if (savedSymbol) {
      return `/search/${savedSymbol}`;
    } else {
      return "/search/home";
    }
  }
  return (

    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#1A237E' }}>
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/" style={{ color: 'white', textDecoration: 'none' }}>Stock Search</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav ms-auto text-center">
            <Button  className="text-center p-0 m-0 bg-transparent" style={{borderWidth: "0"}} onClick={() => handleJump()}></Button>
            <NavLink className="my-nav-link-normal text-center p-0 m-0" to={getSearchPath()} style={({ isActive }) => isActive ? activeStyle : null}><p className="text-center p-0 m-0">Search</p></NavLink>
            <NavLink className="my-nav-link-normal" to="/watchlist" style={({ isActive }) => isActive ? activeStyle : null}><p className="text-center p-0 m-0">Watchlist</p></NavLink>
            <NavLink className="my-nav-link-normal" to="/portfolio" style={({ isActive }) => isActive ? activeStyle : null}><p className="text-center p-0 m-0">Portfolio</p></NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MyNavbar;
