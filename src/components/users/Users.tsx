import { useDispatch, useSelector } from "react-redux";
import ConnectButton from "../connectButton/ConnectButton";
import { AppDispatch, RootState } from "../../store/store";
import { FC, useEffect } from "react";
import { fetchAllUsers } from "../../store/actions/auth/userActions";
import { fetchAllNetworks } from "../../store/actions/network/networkActions";
import { useNavigate } from "react-router-dom";

const Users: FC = () => {
   const users: any = useSelector((state: RootState) => state?.user?.allUsers?.data);
   const networks: any = useSelector((state: RootState) => state?.networks?.network?.data);
   const userId = useSelector((state: RootState) => state?.user?.user?.userId);
   const dispatch = useDispatch<AppDispatch>();

   const navigate = useNavigate();

   useEffect(() => {
      dispatch(fetchAllUsers());
      dispatch(fetchAllNetworks());
   }, []);

   const isFollowing = (id: any) => {
      return networks?.some((ob: any) => {
         return id == ob?.targetUserId && ob?.sourceUserId === userId;
      });
   };

   const handleClick = (id: number, email: string) => {
      navigate(`/others-profile?userId=${id}&email=${email}`);
   };

   return (
      <div className="flex flex-col overflow-y-auto px-3 py-2">
         {users?.map((user: any) =>
            user?.role !== "admin" && user?._id !== userId ? (
               <div
                  key={user?._id}
                  className="flex items-center gap-3 px-2 py-3 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100 last:border-b-0 group"
               >
                  {/* Avatar */}
                  <div
                     className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer ring-2 ring-slate-100 group-hover:ring-orange-400/50 transition-all bg-slate-100"
                     onClick={() => handleClick(user?._id, user?.email)}
                  >
                     <img
                        src={user?.profilePhoto || "/placeholder-avatar.png"}
                        alt={user?.fullName || "Profile"}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                           e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user?.fullName || "User"
                           )}&background=F97316&color=fff`;
                        }}
                     />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0" onClick={() => handleClick(user?._id, user?.email)}>
                     <p className="text-slate-800 text-sm font-semibold truncate group-hover:text-orange-600 transition-colors">
                        {user?.fullName}
                     </p>
                     <p className="text-slate-400 text-xs truncate font-medium">
                        {user?.email?.split("@")[0] ? `@${user.email.split("@")[0]}` : user?.email}
                     </p>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                     {isFollowing(user?._id) ? (
                        <button
                           onClick={() => handleClick(user?._id, user?.email)}
                           className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all duration-200"
                        >
                           View
                        </button>
                     ) : (
                        <ConnectButton id={user?._id} content="Follow" />
                     )}
                  </div>
               </div>
            ) : null
         )}
      </div>
   );
};

export default Users;
