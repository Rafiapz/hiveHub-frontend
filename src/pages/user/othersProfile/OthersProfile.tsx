import Menu from "../../../components/menu/Menu";
import { Link, Outlet, useSearchParams } from "react-router-dom";
import Comments from "../../../components/comments/Comments";
import RightSideBar from "../../../components/rightSideBar/RightSideBar";
import OthersCoverPhoto from "../../../components/OthersCoverPhoto/OthersCoverPhoto";
import UnfollowModal from "../../../components/modal/UnfollowModal";
import { useEffect, useState } from "react";
import Header from "../../../components/header/Header";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import Popup from "../../../components/notification/Popup";
import socketService from "../../../service/socketService";
import VideoCall from "../../../components/videoCall/VideoCall";

const socket = socketService.socket;

function OthersProfile() {
   const [searchQuery] = useSearchParams();
   const [classs, setClasss] = useState({
      posts: "",
      following: "",
      polls: "",
      followers: "",
      likes: "",
      reports: "",
   });
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

   const target = searchQuery.get("userId");
   const email = searchQuery.get("email");

   useEffect(() => {
      setClasss((prev) => {
         return {
            ...prev,
            followers: "",
            posts: "font-bold underline underline-offset-2",
            polls: "",
            following: "",
            likes: "",
            reports: "",
         };
      });
   }, [email]);

   const handleClick = (position: string) => {
      setClasss((prev) => {
         return {
            ...prev,
            followers: "",
            posts: "",
            polls: "",
            following: "",
            likes: "",
            reports: "",
            [position]: "font-bold underline underline-offset-2",
         };
      });
   };
   return (
      <>
         <Menu />
         <Header />
         <Popup notification={notified} data={notificationData} />
         <OthersCoverPhoto />
         <div className="flex flex-wrap justify-center mt-20  py-4 sm:py-8">
            <Link
               onClick={() => handleClick("posts")}
               to={`/others-profile?userId=${target}&email=${email}`}
               className={`px-2 py-1 ${classs.posts}   rounded-md text-black text-xl u focus:outline-none `}
            >
               Posts
            </Link>
            <Link
               onClick={() => handleClick("polls")}
               to={`/others-profile/polls?userId=${target}&email=${email}`}
               className={`px-2 py-1 ${classs.polls} rounded-md text-black text-xl u focus:outline-none `}
            >
               Polls
            </Link>
         </div>
         <Outlet />
         <Comments />
         <UnfollowModal />
         <RightSideBar />
         <VideoCall />
      </>
   );
}

export default OthersProfile;
