import { FC, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchOtherUser, fetchuser } from "../../store/actions/auth/userActions";
import ConnectButton from "../connectButton/ConnectButton";
import { handleUnfollowModal } from "../../store/slices/network/networkSlice";
import { faBan, faCheckCircle, faCrown, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { blockOtherUser, unblockOtherUser } from "../../service/api";
import toast from "react-hot-toast";
import { fetchUsersPost } from "../../store/actions/post/postActions";

const OthersCoverPhoto: FC = () => {
   const [userData, setUserData] = useState<any>({});
   const [searchQuery] = useSearchParams();
   const networks: any = useSelector((state: RootState) => state?.networks?.network?.data);
   const dispatch = useDispatch<AppDispatch>();
   const userId: any = useSelector((state: RootState) => state.user.user.userId);
   const ownData: any = useSelector((state: RootState) => state?.user.user?.data);

   const email = searchQuery.get("email");

   useEffect(() => {
      dispatch(fetchuser());
   }, [dispatch]);

   useEffect(() => {
      if (email) {
         dispatch(fetchOtherUser(email)).then((response: any) => {
            setUserData(response?.payload?.data);
         });
      }
   }, [email, dispatch]);

   const isFollowing = (id: any) => {
      return networks?.some((ob: any) => {
         return id == ob?.targetUserId && ob?.sourceUserId === userId;
      });
   };

   const handleUnfollow = (id: any) => {
      if (!id) toast.error("User not found");
      const data = networks?.filter((ob: any) => ob?.targetUserId === id);
      dispatch(handleUnfollowModal({ status: true, curId: data[0]?._id }));
   };

   const handleBlockUser = async (id: any) => {
      try {
         const form = new FormData();
         form.append("userId", userId);
         form.append("targetUserId", id);

         const response = await blockOtherUser(form);
         toast.success(response?.data?.message);
         dispatch(fetchuser());
         dispatch(fetchUsersPost({ target: id, id: userId }));
      } catch (error: any) {
         toast.error(error?.response?.data?.message);
      }
   };

   const handleUnblockUser = async (id: any) => {
      try {
         const form = new FormData();
         form.append("userId", userId);
         form.append("targetUserId", id);

         const response = await unblockOtherUser(form);
         toast.success(response?.data?.message);
         dispatch(fetchuser());
         dispatch(fetchUsersPost({ target: id, id: userId }));
      } catch (error) {
         toast.error("Something went wrong");
      }
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
                           userData?.fullName || "User"
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

               {/* Action Buttons: Follow/Unfollow & Block/Unblock */}
               <div className="flex items-center gap-2.5 sm:self-end flex-wrap">
                  {isFollowing(userData?._id) ? (
                     <button
                        onClick={() => handleUnfollow(userData?._id)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all"
                     >
                        Following
                     </button>
                  ) : (
                     <ConnectButton id={userData?._id} content={"Follow"} />
                  )}

                  {ownData?.blockedUsers?.includes(userData?._id) ? (
                     <button
                        onClick={() => handleUnblockUser(userData?._id)}
                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold rounded-xl border border-emerald-200 transition-all"
                     >
                        Unblock
                     </button>
                  ) : (
                     <button
                        onClick={() => handleBlockUser(userData?._id)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-semibold rounded-xl border border-red-200 flex items-center gap-1.5 transition-all"
                     >
                        <FontAwesomeIcon icon={faBan} className="text-xs" />
                        <span>Block</span>
                     </button>
                  )}
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

               <p className="text-sm text-slate-500 font-medium">@{username}</p>

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

export default OthersCoverPhoto;
