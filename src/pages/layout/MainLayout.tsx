import Header from "../../components/header/Header";
import Menu from "../../components/menu/Menu";
import RightSideBar from "../../components/rightSideBar/RightSideBar";
import { Outlet } from "react-router-dom";
import VideoCall from "../../components/videoCall/VideoCall";

const MainLayout = () => {
   return (
      <div className="min-h-screen" style={{ background: '#F1F5F9' }}>
         <Header />
         <Menu />
         <div className="pt-14 min-h-screen">
            <Outlet />
         </div>
         <RightSideBar />
         <VideoCall />
      </div>
   );
};

export default MainLayout;
