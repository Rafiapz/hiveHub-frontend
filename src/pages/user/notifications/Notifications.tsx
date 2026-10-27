import { FC, useEffect, useState } from "react";
import Notification from "../../../components/notification/Notification";
import { useSelector } from "react-redux";
import Popup from "../../../components/notification/Popup";
import socketService from "../../../service/socketService";
import { RootState } from "../../../store/store";

const socket = socketService.socket;

const Notifications: FC = () => {
   const [notified, setNotified] = useState<boolean>(false);
   const [notificationData, setNotificationData] = useState<any>(null);
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
   }, [socket, userId]);

   return (
      <div className="sm:ml-64 min-h-screen px-3 sm:px-6 py-6 max-w-4xl mx-auto" style={{ background: "#F1F5F9" }}>
         <Popup notification={notified} data={notificationData} />
         <Notification />
      </div>
   );
};

export default Notifications;
