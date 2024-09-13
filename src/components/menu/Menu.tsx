import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faHome,
   faBell,
   faCommentDots,
   faUserCircle,
   faPlusCircle,
   faTimes,
   faBars,
   faClipboardList,
   faChartPie,
   faCrown,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { handleCreatePostModal } from "../../store/slices/posts/postSlice";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../store/store";
import { fetchuser } from "../../store/actions/auth/userActions";

function Menu() {
   const role = useSelector((state: RootState) => state.user.user.auth.role);
   const [isOpen, setIsOpen] = useState(false);

   const toggleMenu = () => {
      setIsOpen(!isOpen);
   };

   const location = useLocation();

   const dispatch = useDispatch<AppDispatch>();

   useEffect(() => {
      dispatch(fetchuser());
   }, [role]);

   return (
      <>
         <button onClick={toggleMenu} className={` fixed top-0  z-50 sm:hidden bg-orange-400 p-1 rounded-sm text-white w-10 `}>
            {isOpen ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faBars} />}
         </button>

         <div
            className={`bg-white h-full w-72 z-20 fixed top-12 sm:top-8 left-0 flex flex-col  shadow-lg transition-transform duration-300 ${
               isOpen ? "translate-x-0" : "-translate-x-full"
            } sm:translate-x-0`}
         >
            <div className="p-4 flex flex-col space-y-4">
               {role === "admin" ? (
                  <>
                     <Link
                        to="/admin/posts"
                        className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
                     >
                        <FontAwesomeIcon icon={faHome} className="mr-2 text-orange-400 " />
                        Home
                     </Link>
                     <Link to="/admin" className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300">
                        <FontAwesomeIcon icon={faChartPie} className="mr-2 text-orange-400 " />
                        Dashboard
                     </Link>
                     <Link
                        to="/admin/reports"
                        className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
                     >
                        <FontAwesomeIcon icon={faClipboardList} className="mr-2 text-orange-400 " />
                        View Reports
                     </Link>

                     <Link
                        to="/admin/messages"
                        className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
                     >
                        <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-orange-400 " />
                        Messages
                     </Link>
                     <Link
                        to="/admin/notifications"
                        className="relative flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
                     >
                        <FontAwesomeIcon icon={faBell} className="mr-2 text-orange-400 " />
                        Notifications
                     </Link>

                     <Link
                        to="/admin/profile"
                        className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
                     >
                        <FontAwesomeIcon icon={faUserCircle} className="mr-2 text-orange-400 " />
                        My Profile
                     </Link>

                     <Link
                        to="/admin/polls"
                        className="sidebar-link flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
                     >
                        <i className="fas fa-poll text-orange-400  mr-2"></i>
                        New Poll
                     </Link>
                  </>
               ) : (
                  <>
                     <Link
                        to="/"
                        className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300 hover:text-blue-600"
                     >
                        <FontAwesomeIcon icon={faHome} className="mr-2 text-orange-400 transition-colors duration-300" />
                        Home
                     </Link>
                     <Link
                        to="/messages"
                        className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
                     >
                        <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-orange-400 " />
                        Messages
                     </Link>
                     <Link
                        to="/notifications"
                        className="relative flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
                     >
                        <FontAwesomeIcon icon={faBell} className="mr-2 text-orange-400 " />
                        Notifications
                     </Link>

                     <Link to="/premium" className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300">
                        <FontAwesomeIcon icon={faCrown} className="mr-2 text-orange-400" />
                        Premium
                     </Link>

                     <Link to="/profile" className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300">
                        <FontAwesomeIcon icon={faUserCircle} className="mr-2 text-orange-400" />
                        My Profile
                     </Link>

                     <Link
                        to="/polls"
                        className="sidebar-link flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
                     >
                        <i className="fas fa-poll text-orange-400 mr-2"></i>
                        New Poll
                     </Link>
                  </>
               )}
            </div>
            <div className="p-4 ">
               {(location?.pathname === "/" || location?.pathname === "/admin/posts") && (
                  <button
                     onClick={() => dispatch(handleCreatePostModal())}
                     className=" hover:bg-orange-500 text-white bg-orange-400 font-semibold py-2 px-4 w-full rounded flex items-center justify-center transition-colors duration-300"
                  >
                     <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                     New Post
                  </button>
               )}
            </div>
         </div>
      </>
   );
}

export default Menu;
