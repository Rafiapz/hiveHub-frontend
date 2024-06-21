import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { handleEditUserPhotosModal } from "../../store/slices/user/userSlice";
import { FC } from "react";

const EditCoverPhoto: FC = () => {
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);

   const dispatch = useDispatch<AppDispatch>();

   return (
      <div className="flex justify-center w-full h-64 mt-12 ">
         <div style={{ width: "800px" }} className="user-profile mt-1 bg-white rounded-lg shadow-lg h-full relative">
            <div className="cover-photo mb-4 w-full h-full relative">
               {" "}
               <img src={userData?.coverPhoto} alt="Cover" className="rounded-lg w-full h-full object-cover absolute top-0 left-0" />
               <div
                  onClick={() => dispatch(handleEditUserPhotosModal({ status: true, type: "coverPhoto" }))}
                  className="absolute top-0 right-0 p-2 z-10"
               >
                  <FontAwesomeIcon icon={faPen} className="text-blue-500" />
               </div>
               <div className="profile-photo absolute bottom-0 left-12 top-52 rounded-full w-28 h-28 bg-white z-20">
                  <img src={userData?.profilePhoto} alt="Profile" className="rounded-full w-full h-full object-cover" />
                  <div
                     onClick={() => dispatch(handleEditUserPhotosModal({ status: true, type: "profilePhoto" }))}
                     className="absolute top-0 right-0 p-2 z-30"
                  >
                     <FontAwesomeIcon icon={faPen} className="text-blue-500" />
                  </div>
               </div>
            </div>
            <div className="flex justify-between items-center absolute mb-16 ">
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
            </div>
         </div>
      </div>
   );
};

export default EditCoverPhoto;
