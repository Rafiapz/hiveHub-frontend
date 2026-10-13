import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCrown, faArrowLeft, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { handleEditUserPhotosModal } from "../../store/slices/user/userSlice";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAction } from "../../store/actions/auth/userActions";
import socketService from "../../service/socketService";

const socket = socketService.socket;

const EditCoverPhoto: FC = () => {
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const dispatch = useDispatch<AppDispatch>();
   const navigate = useNavigate();

   const username = userData?.email ? userData.email.split("@")[0] : "hiveuser";

   const handleLogout = () => {
      dispatch(logoutAction()).then((response) => {
         if (response?.payload?.status === "ok") {
            socket.disconnect();
            navigate("/");
         }
      });
   };

   return (
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-6 transition-all">
         {/* Top Navigation bar */}
         <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <button
               onClick={() => navigate("/profile")}
               className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
               <FontAwesomeIcon icon={faArrowLeft} />
               <span>Back to Profile</span>
            </button>
            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                  Editing Profile
               </span>
               <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-xs"
               >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Log Out</span>
               </button>
            </div>
         </div>

         {/* Cover Banner with Edit Trigger */}
         <div className="relative h-44 sm:h-60 md:h-72 w-full bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 overflow-hidden group">
            {userData?.coverPhoto ? (
               <img
                  src={userData.coverPhoto}
                  alt="Cover"
                  className="w-full h-full object-cover"
               />
            ) : (
               <div className="w-full h-full flex items-center justify-center opacity-30">
                  <div className="w-96 h-96 rounded-full bg-white/20 blur-3xl transform -translate-y-12"></div>
               </div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all" />

            <button
               type="button"
               onClick={() => dispatch(handleEditUserPhotosModal({ status: true, type: "coverPhoto" }))}
               className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg transition-all"
            >
               <FontAwesomeIcon icon={faCamera} className="text-xs" />
               <span>Change Cover</span>
            </button>
         </div>

         {/* Profile Avatar & Info Row */}
         <div className="px-4 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
               {/* Avatar with Edit Badge */}
               <div className="relative inline-block group">
                  <img
                     src={userData?.profilePhoto || "/placeholder-avatar.png"}
                     alt={userData?.fullName || "Profile"}
                     className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white shadow-md bg-white"
                     onError={(e: any) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                           userData?.fullName || "Hive User"
                        )}&background=F97316&color=fff&size=150`;
                     }}
                  />
                  <button
                     type="button"
                     onClick={() => dispatch(handleEditUserPhotosModal({ status: true, type: "profilePhoto" }))}
                     className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center ring-2 ring-white shadow-md transition-all"
                     title="Update Profile Photo"
                  >
                     <FontAwesomeIcon icon={faCamera} className="text-xs" />
                  </button>
               </div>
            </div>

            {/* Name and Email */}
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                     {userData?.fullName || "HiveHub User"}
                  </h2>
                  {userData?.premium && (
                     <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <FontAwesomeIcon icon={faCrown} className="text-amber-500 text-xs" />
                        Premium
                     </span>
                  )}
               </div>
               <p className="text-xs text-slate-500 font-medium">@{username}</p>
            </div>
         </div>
      </div>
   );
};

export default EditCoverPhoto;
