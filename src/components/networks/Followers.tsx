import { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchFollowers } from "../../store/actions/network/networkActions";
import { useNavigate } from "react-router-dom";

const Followers: FC = () => {
   const followers: any = useSelector((state: RootState) => state?.networks?.followers?.data);
   const navigate = useNavigate();

   const dispatch = useDispatch<AppDispatch>();

   useEffect(() => {
      dispatch(fetchFollowers());
   }, []);

   const handleClick = (id: number, email: string) => {
      navigate(`/others-profile?userId=${id}&email=${email}`);
   };

   return (
      <div className="flex flex-col  md:ml-32 lg:ml-64 xl:ml-[370px]  relative overflow-y-auto">
         {followers?.map((item: any) => (
            <div key={item?._id} className="user-card bg-white rounded-lg w-4/5 sm:w-60 md:w-72 lg:w-80 shadow-lg p-4 my-2 mx-2 sm:my-4 sm:mx-4">
               <div className="flex items-center mb-2">
                  <div className="profile-photo mr-4">
                     <img src={item?.sourceUserId?.profilePhoto} alt="Profile" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full" />
                  </div>
                  <div className="user-name text-base sm:text-lg font-semibold">
                     {item?.sourceUserId?.fullName}
                     <div className="mt-2 sm:mt-0">
                        <button
                           onClick={() => handleClick(item?.targetUserId?._id, item?.targetUserId?.email)}
                           className="px-2 sm:px-3 py-1 rounded-md text-black font-bold border border-black bg-white hover:bg-gray-200 focus:outline-none transition-colors duration-300"
                        >
                           View
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
};

export default Followers;
