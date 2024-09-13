import { FC, useEffect, useState } from "react";
import MessageBox from "../../components/message/MessageBox";
import socketService from "../../service/socketService";
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
      <div>
         {/* <Header />
         <Menu /> */}
         <Popup notification={notified} data={notificationData} />
         <MessageBox />
         {/* <div className="hidden lg:block">
            <RightSideBar />
         </div> */}
      </div>
   );
};

export default Messages;
