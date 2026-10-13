import { FC, useEffect, useState } from "react";
import socketService from "../../../service/socketService";
import { RootState } from "../../../store/store";
import { useSelector } from "react-redux";
import Popup from "../../../components/notification/Popup";
import VideoCall from "../../../components/videoCall/VideoCall";
import PollInput from "../../../components/Polls/PollInput";
import Poll from "../../../components/Polls/Poll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

const socket = socketService.socket;

const PollPage: FC = () => {
   const [activeTab, setActiveTab] = useState<"browse" | "create">("browse");
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
   }, [socket, userId]);

   return (
      <div className="sm:ml-64 min-h-screen px-3 sm:px-6 py-6 max-w-4xl mx-auto" style={{ background: "#F1F5F9" }}>
         <Popup notification={notified} data={notificationData} />

         {/* Polls Page Header & Navigation */}
         <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Community Polls
               </h1>
               <p className="text-xs text-slate-500 mt-0.5">
                  Vote on discussions or create your own poll for the hive
               </p>
            </div>

            {/* Toggle Segment */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
               <button
                  onClick={() => setActiveTab("browse")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                     activeTab === "browse"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
               >
                  <FontAwesomeIcon icon={faChartBar} className="text-xs" />
                  <span>Browse Polls</span>
               </button>
               <button
                  onClick={() => setActiveTab("create")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                     activeTab === "create"
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
               >
                  <FontAwesomeIcon icon={faPlusCircle} className="text-xs" />
                  <span>Create Poll</span>
               </button>
            </div>
         </div>

         {/* Body depending on active tab */}
         <div className="pb-12">
            {activeTab === "browse" ? (
               <Poll />
            ) : (
               <PollInput onPollCreated={() => setActiveTab("browse")} />
            )}
         </div>

         <VideoCall />
      </div>
   );
};

export default PollPage;
