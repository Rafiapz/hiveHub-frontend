import { useEffect, useState } from "react";
import Popup from "../../../components/notification/Popup";
import UsersTable from "../../../components/usersTable/UsersTable";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import socketService from "../../../service/socketService";
import VideoCall from "../../../components/videoCall/VideoCall";
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
         <Popup notification={notified} data={notificationData} />
         {/* <AdminCard /> */}
         <UsersTable />

         <VideoCall />
      </>
   );
};

export default Dashboard;
