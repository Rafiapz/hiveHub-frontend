import { Link, Outlet, useLocation } from "react-router-dom";
import Comments from "../../../components/comments/Comments";
import ConverPhoto from "../../../components/converPhoto/CoverPhoto";
import UnfollowModal from "../../../components/modal/UnfollowModal";
import { useEffect, useState } from "react";
import CreatePostModal from "../../../components/modal/CreatePostModal";
import EditPostModal from "../../../components/modal/EditPostModal";
import Popup from "../../../components/notification/Popup";
import socketService from "../../../service/socketService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import VideoCall from "../../../components/videoCall/VideoCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faThLarge,
   faChartBar,
   faUserCheck,
   faUsers,
   faHeart,
} from "@fortawesome/free-solid-svg-icons";

const socket = socketService.socket;

function Profile() {
   const [notified, setNotified] = useState<boolean>(false);
   const [notificationData, setNotificationData] = useState<any>(null);
   const userId = useSelector((state: RootState) => state?.user?.user?.userId);
   const location = useLocation();

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

   const currentTab = (() => {
      const path = location.pathname;
      if (path === "/profile/polls") return "polls";
      if (path === "/profile/following") return "following";
      if (path === "/profile/followers") return "followers";
      if (path === "/profile/likes") return "likes";
      return "posts";
   })();

   const tabs = [
      { id: "posts", label: "Posts", path: "/profile", icon: faThLarge },
      { id: "polls", label: "Polls", path: `/profile/polls?userId=${userId}`, icon: faChartBar },
      { id: "following", label: "Following", path: "/profile/following", icon: faUserCheck },
      { id: "followers", label: "Followers", path: "/profile/followers", icon: faUsers },
      { id: "likes", label: "Likes", path: "/profile/likes", icon: faHeart },
   ];

   return (
      <div className="sm:ml-64 min-h-screen px-3 sm:px-6 py-6 max-w-5xl mx-auto" style={{ background: "#F1F5F9" }}>
         {/* Profile Cover & Header Card */}
         <ConverPhoto />

         {/* Modern Segmented Navigation Tabs */}
         <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-sm mb-6 flex items-center overflow-x-auto no-scrollbar gap-1">
            {tabs.map((tab) => {
               const isActive = currentTab === tab.id;
               return (
                  <Link
                     key={tab.id}
                     to={tab.path}
                     className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-1 text-center ${
                        isActive
                           ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                           : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                     }`}
                  >
                     <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                     <span>{tab.label}</span>
                  </Link>
               );
            })}
         </div>

         {/* Tab Content */}
         <div className="pb-12">
            <Outlet />
         </div>

         {/* Modals and Support Components */}
         <CreatePostModal />
         <EditPostModal />
         <Comments />
         <Popup notification={notified} data={notificationData} />
         <UnfollowModal />
         <VideoCall />
      </div>
   );
}

export default Profile;
