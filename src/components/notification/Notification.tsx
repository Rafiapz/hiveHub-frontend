import React, { useEffect, useState } from "react";
import { deleteNotification, fetchNotifications } from "../../service/api";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { format } from "timeago.js";
import { fetchAllNetworks } from "../../store/actions/network/networkActions";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faBell,
   faHeart,
   faComment,
   faUserPlus,
   faTrash,
   faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const Notification: React.FC<any> = () => {
   const [notifications, setNotifications] = useState<any[]>([]);
   const [filter, setFilter] = useState<string>("all");
   const [loading, setLoading] = useState<boolean>(true);
   const userId = useSelector((state: RootState) => state?.user?.user?.userId);
   const [page] = useState<number>(1);
   const navigate = useNavigate();
   const dispatch = useDispatch<AppDispatch>();

   useEffect(() => {
      dispatch(fetchAllNetworks());
   }, [dispatch]);

   useEffect(() => {
      fetchData();
   }, [userId]);

   const fetchData = async () => {
      try {
         setLoading(true);
         const response = await fetchNotifications(userId, page);
         setNotifications(response?.data?.data || []);
      } catch (error) {
         toast.error("Failed to load notifications");
      } finally {
         setLoading(false);
      }
   };

   const handleDelete = async (id: any, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
         await deleteNotification(id);
         setNotifications((prev) => prev.filter((n) => n._id !== id));
         toast.success("Notification dismissed");
      } catch (error) {
         toast.error("Failed to delete notification");
      }
   };

   const handleNavigate = (id: any, email: string) => {
      if (id && email) {
         navigate(`/others-profile?userId=${id}&email=${email}`);
      }
   };

   const getNotificationType = (message: string = "") => {
      const lower = message.toLowerCase();
      if (lower.includes("like")) {
         return {
            icon: faHeart,
            color: "text-rose-500 bg-rose-50 border-rose-200",
            badge: "bg-rose-500",
            category: "likes",
         };
      }
      if (lower.includes("comment")) {
         return {
            icon: faComment,
            color: "text-blue-500 bg-blue-50 border-blue-200",
            badge: "bg-blue-500",
            category: "comments",
         };
      }
      if (lower.includes("follow")) {
         return {
            icon: faUserPlus,
            color: "text-emerald-500 bg-emerald-50 border-emerald-200",
            badge: "bg-emerald-500",
            category: "follows",
         };
      }
      return {
         icon: faBell,
         color: "text-orange-500 bg-orange-50 border-orange-200",
         badge: "bg-orange-500",
         category: "system",
      };
   };

   const filteredNotifications = notifications.filter((n: any) => {
      if (filter === "all") return true;
      const type = getNotificationType(n?.message);
      return type.category === filter;
   });

   return (
      <div className="w-full">
         {/* Notifications Header Card */}
         <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                     <FontAwesomeIcon icon={faBell} className="text-xl" />
                  </div>
                  <div>
                     <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Notifications
                     </h1>
                     <p className="text-xs text-slate-500">
                        Stay updated on likes, comments, and new followers
                     </p>
                  </div>
               </div>

               <span className="self-start sm:self-center px-3 py-1 bg-orange-50 text-orange-700 font-semibold text-xs rounded-full border border-orange-200/60">
                  {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
               </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
               {[
                  { id: "all", label: "All" },
                  { id: "likes", label: "Likes" },
                  { id: "comments", label: "Comments" },
                  { id: "follows", label: "Followers" },
               ].map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setFilter(tab.id)}
                     className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                        filter === tab.id
                           ? "bg-slate-900 text-white shadow-xs"
                           : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                     }`}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Notifications List */}
         {loading ? (
            <div className="space-y-3">
               {[1, 2, 3, 4].map((i) => (
                  <div
                     key={i}
                     className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm animate-pulse flex items-center gap-4"
                  >
                     <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
                     <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                     </div>
                  </div>
               ))}
            </div>
         ) : filteredNotifications.length > 0 ? (
            <div className="space-y-2.5">
               {filteredNotifications.map((notification: any, i: number) => {
                  const type = getNotificationType(notification?.message);
                  const actor = notification?.actionBy;

                  return (
                     <div
                        key={notification?._id || i}
                        onClick={() => handleNavigate(actor?._id, actor?.email)}
                        className="group bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer"
                     >
                        <div className="flex items-center gap-3.5 min-w-0">
                           {/* Avatar with contextual indicator badge */}
                           <div className="relative flex-shrink-0">
                              <img
                                 src={actor?.profilePhoto || "/placeholder-avatar.png"}
                                 alt={actor?.fullName || "User"}
                                 className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-orange-400 transition-all"
                                 onError={(e: any) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                       actor?.fullName || "User"
                                    )}&background=F97316&color=fff`;
                                 }}
                              />
                              <span
                                 className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${type.badge} text-white flex items-center justify-center text-[9px] ring-2 ring-white shadow-xs`}
                              >
                                 <FontAwesomeIcon icon={type.icon} />
                              </span>
                           </div>

                           {/* Description */}
                           <div className="min-w-0 flex-1">
                              <p className="text-sm text-slate-800 leading-snug">
                                 <span className="font-bold text-slate-900 hover:text-orange-600 transition-colors mr-1">
                                    {actor?.fullName || "Someone"}
                                 </span>
                                 <span className="text-slate-600">{notification?.message}</span>
                              </p>
                              <span className="text-xs text-slate-400 mt-0.5 block">
                                 {format(notification?.createdAt)}
                              </span>
                           </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                           <button
                              onClick={(e) => handleDelete(notification?._id, e)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-80 group-hover:opacity-100"
                              title="Delete notification"
                           >
                              <FontAwesomeIcon icon={faTrash} className="text-xs" />
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm max-w-md mx-auto my-8">
               <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-2xl" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">You're all caught up!</h3>
               <p className="text-xs text-slate-500 mt-1">
                  {filter === "all"
                     ? "No notifications right now. Check back later when people interact with your hive!"
                     : `No ${filter} notifications found.`}
               </p>
            </div>
         )}
      </div>
   );
};

export default Notification;
