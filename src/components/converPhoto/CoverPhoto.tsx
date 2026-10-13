import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../store/store";
import { FC, useEffect } from "react";
import { fetchuser } from "../../store/actions/auth/userActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faShareAlt, faCheckCircle, faEnvelope, faCrown } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const CoverPhoto: FC = () => {
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const dispatch = useDispatch<AppDispatch>();
   const navigate = useNavigate();

   useEffect(() => {
      dispatch(fetchuser());
   }, [dispatch]);

   const handleEditProfile = () => {
      navigate("/edit-profile");
   };

   const handleShareProfile = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard!");
   };

   const username = userData?.email ? userData.email.split("@")[0] : "hiveuser";

   return (
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-6 transition-all">
         {/* Cover Banner */}
         <div className="relative h-44 sm:h-60 md:h-72 w-full bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
         </div>

         {/* Profile Info Section */}
         <div className="px-4 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
               {/* Avatar */}
               <div className="relative inline-block">
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
                  {userData?.premium && (
                     <span
                        className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center ring-2 ring-white shadow-sm"
                        title="Premium Member"
                     >
                        <FontAwesomeIcon icon={faCrown} className="text-xs" />
                     </span>
                  )}
               </div>

               {/* Profile Actions */}
               <div className="flex items-center gap-2.5 sm:self-end">
                  <button
                     onClick={handleEditProfile}
                     className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all"
                  >
                     <FontAwesomeIcon icon={faEdit} className="text-xs" />
                     <span>Edit Profile</span>
                  </button>

                  <button
                     onClick={handleShareProfile}
                     className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all"
                     title="Copy profile link"
                  >
                     <FontAwesomeIcon icon={faShareAlt} className="text-xs" />
                     <span className="hidden sm:inline">Share</span>
                  </button>
               </div>
            </div>

            {/* User Details */}
            <div className="space-y-2">
               <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                     {userData?.fullName || "HiveHub User"}
                  </h1>
                  {userData?.premium && (
                     <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-amber-500 text-xs" />
                        Verified
                     </span>
                  )}
               </div>

               <p className="text-sm text-slate-500 font-medium">
                  @{username}
               </p>

               <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                     <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                     {userData?.email}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-medium">
                     HiveHub Member
                  </span>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CoverPhoto;
