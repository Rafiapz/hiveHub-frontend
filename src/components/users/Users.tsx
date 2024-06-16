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

   // const handleMeessageClick = (id: number) => {
   //    navigate(`/messages?userId=${id}`);
   // };

   return (
      <div className="flex flex-col items-center overflow-y-auto">
         {users?.map((user: any) => (
            <div key={user?._id} className="w-full max-w-md mb-6">
               {user?.role !== "admin" && (
                  <div className="user-card bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                     <div className="flex p-6">
                        <div className="profile-photo hover:cursor-pointer" onClick={() => handleClick(user?._id, user?.email)}>
                           <img src={user?.profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                        </div>
                        <div className="ml-4 flex-grow">
                           <div className="user-name text-lg font-semibold hover:cursor-pointer">
                              <div onClick={() => handleClick(user?._id, user?.email)}>{user?.fullName}</div>
                           </div>
                           <div className="mt-2 flex items-center">
                              {isFollowing(user?._id) ? (
                                 <button
                                    onClick={() => handleClick(user?._id, user?.email)}
                                    className="px-3 py-1 rounded-md text-black font-bold border border-black bg-white hover:bg-gray-200 focus:outline-none transition-colors duration-300"
                                 >
                                    View
                                 </button>
                              ) : (
                                 <ConnectButton id={user?._id} content="Follow" />
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         ))}
      </div>
   );
};

export default Users;
