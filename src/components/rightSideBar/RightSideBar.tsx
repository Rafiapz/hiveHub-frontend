import Searchbox from "../search/Searchbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faUsers } from "@fortawesome/free-solid-svg-icons";
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

   if (
      pathname === "/messages" ||
      pathname === "/admin/messages" ||
      pathname.startsWith("/profile") ||
      pathname === "/edit-profile" ||
      pathname.startsWith("/others-profile") ||
      pathname === "/notifications" ||
      pathname === "/premium" ||
      pathname === "/polls"
   ) {
      return null;
   }

   return (
      <div className="hidden md:flex mt-14 h-[calc(100vh-56px)] w-72 fixed top-0 right-0 flex-col bg-white border-l border-slate-200/80 shadow-xs">
         {/* Search section */}
         <div className="p-4 border-b border-slate-100">
            <Searchbox />
         </div>

         {/* People you may know */}
         <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
               <FontAwesomeIcon icon={faUsers} className="text-orange-500 text-sm" />
               <span className="text-slate-500 text-xs font-bold tracking-wider uppercase">People you may know</span>
            </div>
         </div>

         {/* Users list */}
         <div className="flex-1 overflow-y-auto">
            <Users />
         </div>

         {/* Logout button */}
         {pathname === "/edit-profile" && (
            <div className="p-4 border-t border-slate-100">
               <button
                  onClick={() => handleLogout()}
                  className="w-full flex items-center justify-center gap-2 text-rose-600 font-semibold py-2.5 px-4 rounded-xl text-sm bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all duration-200 shadow-2xs"
               >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Log Out</span>
               </button>
            </div>
         )}
      </div>
   );
};

export default RightSideBar;
