import { FC, useEffect, useState } from "react";
import socketService from "../../../service/socketService";
import { RootState } from "../../../store/store";
import { useSelector } from "react-redux";
import Popup from "../../../components/notification/Popup";
import VideoCall from "../../../components/videoCall/VideoCall";
import PollInput from "../../../components/Polls/PollInput";

const socket = socketService.socket;

const PollPage: FC = () => {
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
   }, [socket]);

   return (
      <div className="mt-12">
         <Popup notification={notified} data={notificationData} />
         <PollInput />
         <VideoCall />
      </div>
   );
};

export default PollPage;
