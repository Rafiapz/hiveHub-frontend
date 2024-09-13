import Header from "../../components/header/Header";
import Menu from "../../components/menu/Menu";

import RightSideBar from "../../components/rightSideBar/RightSideBar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
   return (
      <div>
         <Header />
         <Menu />
         <Outlet />
         <RightSideBar />
      </div>
   );
};

export default MainLayout;
