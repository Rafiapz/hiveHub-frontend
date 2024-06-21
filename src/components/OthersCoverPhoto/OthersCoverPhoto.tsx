import { FC, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchOtherUser, fetchuser } from "../../store/actions/auth/userActions";
import ConnectButton from "../connectButton/ConnectButton";
import { handleUnfollowModal } from "../../store/slices/network/networkSlice";
import { faBan } from "@fortawesome/free-solid-svg-icons";
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
   }, []);

   useEffect(() => {
      if (email) {
         dispatch(fetchOtherUser(email)).then((reponse: any) => {
            setUserData(reponse?.payload?.data);
         });
      }
   }, [email]);

   const isFollowing = (id: any) => {
      return networks?.some((ob: any) => {
         return id == ob?.targetUserId && ob?.sourceUserId === userId;
      });
   };

   const handleUnfollow = (id: any) => {
      if (!id) toast.error("Not ");
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

   return (
      <div className="flex justify-center w-full h-64">
         <div style={{ width: "800px" }} className="user-profile mt-1 bg-white rounded-lg shadow-lg h-full relative">
            <div className="cover-photo mb-4 w-full h-full relative">
               <img src={userData?.coverPhoto} alt="Cover" className="rounded-lg w-full h-full object-cover" />
            </div>
            <div className="profile-info px-4 py-2">
               <div className="flex">
                  {userData?.premium && (
                     <svg
                        className="fill-current ml-40 mt-1 text-indigo-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                     >
                        <circle cx="8" cy="8" r="8" fill="" />
                        <path d="M5.17 8.5L2.14 5.5L3.5 4.17L8.83 9.5L13.17 5.5z" fill="white" />
                     </svg>
                  )}
                  <h1 className={userData?.premium ? "text-xl ml-4 font-bold" : "text-xl ml-40 font-bold"}>{userData?.fullName}</h1>
               </div>
               <div className="flex justify-end space-x-2">
                  {isFollowing(userData?._id) ? (
                     <button
                        onClick={() => handleUnfollow(userData?._id)}
                        className="bg-white hover:bg-white text-blue-400 border border-black font-bold py-2 px-4 "
                     >
                        Unfollow
                     </button>
                  ) : (
                     <ConnectButton id={userData?._id} content={"Follow"} />
                  )}

                  {/* <button className="message-button border border-blue-700 rounded-3xl text-black font-semibold py-2 px-4 focus:outline-none   hover:bg-green-200">
                     <FontAwesomeIcon icon={faEnvelope} /> Message
                  </button> */}

                  {ownData?.blockedUsers?.includes(userData?._id) ? (
                     <button
                        onClick={() => handleUnblockUser(userData?._id)}
                        className="block-button border   text-black font-semibold py-2 px-4 focus:outline-none  hover:bg-green-200 
                        border-green-500"
                     >
                        Unblock
                     </button>
                  ) : (
                     <button
                        onClick={() => handleBlockUser(userData?._id)}
                        className="block-button border  text-black font-semibold py-2 px-4 focus:outline-none  hover:bg-red-200 
                           border-red-700"
                     >
                        <FontAwesomeIcon icon={faBan} /> Block
                     </button>
                  )}
               </div>
            </div>
            <div className="profile-photo absolute top-48 left-8 ml-4 mb-8">
               <img src={userData?.profilePhoto} alt="Profile" className="rounded-full w-28 h-28 object-cover" />
            </div>
         </div>
      </div>
   );
};

export default OthersCoverPhoto;
