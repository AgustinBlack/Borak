import HamburgerMenu from "../HamburguerMenu/HamburgerMenu";

const Nav = ({ user, logout, isAdmin }) => {
  return (
    <>
      <HamburgerMenu user={user} logout={logout} isAdmin={isAdmin} />
    </>
  );
};

export default Nav;