import { FC, lazy, Suspense, useEffect, useState } from "react";
import Header from "../../../components/header/Header";
const Menu = lazy(() => import("../../../components/menu/Menu"));
const PollInput = lazy(() => import("../../../components/Polls/PollInput"));
const RightSideBar = lazy(() => import("../../../components/rightSideBar/RightSideBar"));
import socketService from "../../../service/socketService";
import { RootState } from "../../../store/store";
import { useSelector } from "react-redux";
import Popup from "../../../components/notification/Popup";
import VideoCall from "../../../components/videoCall/VideoCall";

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
         <Suspense fallback={<div>Loading...</div>}>
            <Header />
         </Suspense>
         <Popup notification={notified} data={notificationData} />
         <Suspense fallback={<div>Loading...</div>}>
            <Menu />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <PollInput />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <RightSideBar />
         </Suspense>
         <VideoCall />
      </div>
   );
};

export default PollPage;
