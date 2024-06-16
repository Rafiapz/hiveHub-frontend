import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { format } from "timeago.js";
import { fetchOnlineUsers } from "../../service/api";
import toast from "react-hot-toast";

const Conversations: FC<any> = ({ conversations, handleSelectConversation, setDirect }) => {
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
   const [onlineUsers, setOnlineUsers] = useState<any>([]);

   useEffect(() => {
      handlefetchOnline();
   }, []);

   const handlefetchOnline = async () => {
      try {
         const response = await fetchOnlineUsers();
         setOnlineUsers(response?.data?.data);
      } catch (error) {
         toast.error("Something went wrong");
      }
   };

   return (
      <div className="flex flex-col items-start md:items-center overflow-auto">
         <div className="flex flex-col w-full md:w-1/2 mb-4 md:mb-0">
            {conversations?.map((c: any) => (
               <div
                  key={c?._id}
                  className="user-card bg-white hover:bg-gray-200 rounded-lg shadow-md transition-colors duration-200 cursor-pointer border border-gray-200 p-4 mb-2 last:mb-0"
                  onClick={() => {
                     handleSelectConversation(c);
                     setDirect(true);
                  }}
               >
                  <div className="flex items-center">
                     <div className="profile-photo mr-4">
                        <img
                           src={c?.members[1]?._id !== userId ? c?.members[1].profilePhoto : c?.members[0].profilePhoto}
                           alt="Profile"
                           className="w-14 h-14 rounded-full object-cover"
                        />
                     </div>
                     <div className="flex-grow">
                        <div className="user-name font-semibold text-gray-800">
                           {c?.members[1]?._id !== userId ? c?.members[1].fullName : c?.members[0].fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                           {format(c?.updatedAt || c?.createdAt)}

                           {onlineUsers.includes(c?.members[1]?._id !== userId ? c?.members[1]?._id : c?.members[0]?._id) && (
                              <div className="flex items-center mt-1">
                                 <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                                 <span className="text-green-500">Online</span>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default Conversations;
