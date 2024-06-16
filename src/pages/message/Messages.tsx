import { FC, useEffect, useState } from "react";
import Menu from "../../components/menu/Menu";
import MessageBox from "../../components/message/MessageBox";
import Header from "../../components/header/Header";
import socketService from "../../service/socketService";
import RightSideBar from "../../components/rightSideBar/RightSideBar";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Popup from "../../components/notification/Popup";

const socket = socketService.socket;

const Messages: FC = () => {
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
         <Header />
         <Menu />
         <Popup notification={notified} data={notificationData} />
         <MessageBox />
         <div className="hidden lg:block">
            <RightSideBar />
         </div>
      </>
   );
};

export default Messages;
