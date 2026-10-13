import { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchFollowers } from "../../store/actions/network/networkActions";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUsers } from "@fortawesome/free-solid-svg-icons";

const Followers: FC = () => {
   const followers: any = useSelector((state: RootState) => state?.networks?.followers?.data);
   const navigate = useNavigate();
   const dispatch = useDispatch<AppDispatch>();

   useEffect(() => {
      dispatch(fetchFollowers());
   }, [dispatch]);

   const handleClick = (id: number, email: string) => {
      navigate(`/others-profile?userId=${id}&email=${email}`);
   };

   if (!followers || followers.length === 0) {
      return (
         <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
               <FontAwesomeIcon icon={faUsers} className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No followers yet</h3>
            <p className="text-sm text-slate-500 mt-1">Post updates and engage with posts to grow your hive!</p>
         </div>
      );
   }

   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
         {followers.map((item: any, i: number) => {
            const user = item?.sourceUserId;
            if (!user) return null;

            return (
               <div
                  key={item?._id || i}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
               >
                  <div className="flex items-center gap-3">
                     <img
                        src={user?.profilePhoto || "/placeholder-avatar.png"}
                        onClick={() => handleClick(user?._id, user?.email)}
                        alt={user?.fullName}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 cursor-pointer hover:ring-orange-400 transition-all"
                        onError={(e: any) => {
                           e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user?.fullName || "User"
                           )}&background=F97316&color=fff`;
                        }}
                     />
                     <div className="min-w-0 flex-1">
                        <h4
                           onClick={() => handleClick(user?._id, user?.email)}
                           className="text-sm font-bold text-slate-800 truncate cursor-pointer hover:text-orange-600 transition-colors"
                        >
                           {user?.fullName}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                           {user?.email}
                        </p>
                     </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                     <button
                        onClick={() => handleClick(user?._id, user?.email)}
                        className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                     >
                        <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                        <span>View Profile</span>
                     </button>
                  </div>
               </div>
            );
         })}
      </div>
   );
};

export default Followers;
