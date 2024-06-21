import { FC, useEffect, useState } from "react";
import EditCoverPhoto from "../../../components/converPhoto/EditCoverPhoto";
import Menu from "../../../components/menu/Menu";
import EditUserPhotosModal from "../../../components/modal/EditUserPhotosModal";
import EditUserProfile from "../../../components/profileEdit/EditUserProfile";
import RightSideBar from "../../../components/rightSideBar/RightSideBar";
import Header from "../../../components/header/Header";
import { useSelector } from "react-redux";
import Popup from "../../../components/notification/Popup";
import socketService from "../../../service/socketService";
import { RootState } from "../../../store/store";
import VideoCall from "../../../components/videoCall/VideoCall";

const socket = socketService.socket;

const EditProfile: FC = () => {
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
      <>
         <Menu />
         <Header />
         <Popup notification={notified} data={notificationData} />
         <EditCoverPhoto />
         <EditUserProfile />
         <EditUserPhotosModal />
         <RightSideBar />
         <VideoCall />
      </>
   );
};

export default EditProfile;
