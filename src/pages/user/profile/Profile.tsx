import { Link, Outlet } from "react-router-dom";
import Comments from "../../../components/comments/Comments";
import ConverPhoto from "../../../components/converPhoto/CoverPhoto";
import Menu from "../../../components/menu/Menu";
import RightSideBar from "../../../components/rightSideBar/RightSideBar";
import UnfollowModal from "../../../components/modal/UnfollowModal";
import { useEffect, useState } from "react";
import CreatePostModal from "../../../components/modal/CreatePostModal";
import EditPostModal from "../../../components/modal/EditPostModal";
import Popup from "../../../components/notification/Popup";
import socketService from "../../../service/socketService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import Header from "../../../components/header/Header";

const socket = socketService.socket;

function Profile() {
   const [classs, setClasss] = useState({
      posts: "font-bold underline underline-offset-2",
      following: "",
      polls: "",
      followers: "",
      likes: "",
      reports: "",
   });
   const [notified, setNotified] = useState<boolean>(false);
   const [notificationData, setNotificationData] = useState<any>(null);
   const userId = useSelector((state: RootState) => state?.user?.user?.userId);

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
         <ConverPhoto />
         <div className="flex flex-wrap justify-center sm:mt-20 mt-5 py-4 sm:py-8">
            <Link
               onClick={() => handleClick("posts")}
               to={"/profile"}
               className={`px-2 py-1 ${classs.posts} rounded-md text-black text-sm sm:text-xl u focus:outline-none mb-2 sm:mb-0`}
            >
               Posts
            </Link>
            <Link
               onClick={() => handleClick("polls")}
               to={`/profile/polls?userId=${userId}`}
               className={`px-2 py-1 ${classs.polls} rounded-md text-black text-sm sm:text-xl u focus:outline-none mb-2 sm:mb-0 mx-2 sm:mx-4`}
            >
               Polls
            </Link>
            <Link
               onClick={() => handleClick("following")}
               to={"/profile/following"}
               className={`px-2 py-1 text-sm sm:text-xl ${classs.following} rounded-md text-black focus:outline-none mb-2 sm:mb-0 mx-2 sm:mx-4`}
            >
               Following
            </Link>
            <Link
               onClick={() => handleClick("followers")}
               to={"/profile/followers"}
               className={`px-2 py-1 text-sm sm:text-xl rounded-md ${classs.followers} text-black focus:outline-none mb-2 sm:mb-0 mx-2 sm:mx-4`}
            >
               Followers
            </Link>
            <Link
               onClick={() => handleClick("likes")}
               to={"/profile/likes"}
               className={`px-2 py-1 text-sm sm:text-xl rounded-md ${classs.likes} text-black focus:outline-none mb-2 sm:mb-0 mx-2 sm:mx-4`}
            >
               Likes
            </Link>
         </div>

         <Outlet />
         <CreatePostModal />
         <EditPostModal />
         <Comments />
         <Popup notification={notified} data={notificationData} />
         <UnfollowModal />
         <RightSideBar />
      </>
   );
}

export default Profile;
