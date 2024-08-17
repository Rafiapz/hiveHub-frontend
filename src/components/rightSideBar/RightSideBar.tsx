import Searchbox from "../search/Searchbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutAction } from "../../store/actions/auth/userActions";
import { AppDispatch } from "../../store/store";
import Users from "../users/Users";
import { FC } from "react";
import socketService from "../../service/socketService";
const socket = socketService.socket;

const RightSideBar: FC = () => {
   const dispatch = useDispatch<AppDispatch>();

   const { pathname } = useLocation();

   const navigate = useNavigate();

   const handleLogout = () => {
      dispatch(logoutAction()).then((response) => {
         if (response?.payload?.status === "ok") {
            socket.disconnect();
            navigate("/");
         }
      });
   };

   return (
      <div className="hidden md:flex bg-gray-50 mt-10 h-full w-full fixed top-0 right-0 sm:w-80 flex-col shadow-lg">
         <div className="p-4">
            <Searchbox />
         </div>
         <Users />
         {pathname === "/edit-profile" && (
            <div className="flex justify-end items-start mb-5 p-4">
               <button onClick={() => handleLogout()} className="bg-red-500 mb-2 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Logout
               </button>
            </div>
         )}
      </div>
   );
};

export default RightSideBar;
