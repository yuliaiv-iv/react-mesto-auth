import React from 'react';
import { Link } from 'react-router-dom'
import logo from '../images/logo.svg';

function Header({ email, link, path, onClick }) {
  return (
    <header className="header">
      <img className="header__logo"
        src={logo}
        alt="Логотип"
      />
      <p className="header__email">{email}</p>
      {
        <Link
          className="header__nav opacity"
          to={path}
          onClick={onClick}
        >
          {link}
        </Link>
      }
    </header>
  );
}

export default Header;