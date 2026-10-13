import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
import Comments from "../../../components/comments/Comments";
import OthersCoverPhoto from "../../../components/OthersCoverPhoto/OthersCoverPhoto";
import UnfollowModal from "../../../components/modal/UnfollowModal";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import Popup from "../../../components/notification/Popup";
import socketService from "../../../service/socketService";
import VideoCall from "../../../components/videoCall/VideoCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThLarge, faChartBar } from "@fortawesome/free-solid-svg-icons";

const socket = socketService.socket;

function OthersProfile() {
   const [searchQuery] = useSearchParams();
   const [notified, setNotified] = useState<boolean>(false);
   const [notificationData, setNotificationData] = useState<any>(null);
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
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

   const target = searchQuery.get("userId");
   const email = searchQuery.get("email");

   const currentTab = location.pathname.includes("/polls") ? "polls" : "posts";

   return (
      <div className="sm:ml-64 min-h-screen px-3 sm:px-6 py-6 max-w-5xl mx-auto" style={{ background: "#F1F5F9" }}>
         <Popup notification={notified} data={notificationData} />

         {/* Others Profile Cover & Header */}
         <OthersCoverPhoto />

         {/* Segmented Navigation Tabs */}
         <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-sm mb-6 flex items-center gap-1 max-w-md mx-auto">
            <Link
               to={`/others-profile?userId=${target}&email=${email}`}
               className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-1 text-center ${
                  currentTab === "posts"
                     ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                     : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
               }`}
            >
               <FontAwesomeIcon icon={faThLarge} className="text-xs" />
               <span>Posts</span>
            </Link>

            <Link
               to={`/others-profile/polls?userId=${target}&email=${email}`}
               className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-1 text-center ${
                  currentTab === "polls"
                     ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                     : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
               }`}
            >
               <FontAwesomeIcon icon={faChartBar} className="text-xs" />
               <span>Polls</span>
            </Link>
         </div>

         {/* Content */}
         <div className="pb-12">
            <Outlet />
         </div>

         <Comments />
         <UnfollowModal />
         <VideoCall />
      </div>
   );
}

export default OthersProfile;
