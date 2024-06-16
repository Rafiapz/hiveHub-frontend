import { useEffect, useState } from "react";
import Header from "../../../components/header/Header";
import Menu from "../../../components/menu/Menu";
import Popup from "../../../components/notification/Popup";
import RightSideBar from "../../../components/rightSideBar/RightSideBar";
import UsersTable from "../../../components/usersTable/UsersTable";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import socketService from "../../../service/socketService";
const socket = socketService.socket;

const Dashboard = () => {
   const [notificationData, setNotificationData] = useState<any>(null);
   const [notified, setNotified] = useState<boolean>(false);
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);

   useEffect(() => {
      const getNotifiationEvent = (data: any) => {
         if (data?.senderId !== userId) {
            setNotificationData(data);
            setNotified(true);
         }
      };
      socket.on("getNotifiation", getNotifiationEvent);
      return () => {
         socket.off("getNotifiation", getNotifiationEvent);
      };
   }, [socket]);
   return (
      <>
         <Menu />
         <Header />
         <Popup notification={notified} data={notificationData} />
         {/* <AdminCard /> */}
         <UsersTable />
         <RightSideBar />
      </>
   );
};

export default Dashboard;
