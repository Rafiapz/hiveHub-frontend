import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faHome,
   faBell,
   faCommentDots,
   faUserCircle,
   faPlusCircle,
   faTimes,
   faBars,
   faBlog,
   faClipboardList,
   faChartPie,
   faCrown,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { handleCreatePostModal } from "../../store/slices/posts/postSlice";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../store/store";
import { fetchuser } from "../../store/actions/auth/userActions";

function Menu() {
   const role = useSelector((state: RootState) => state.user.user.auth.role);
   const [isOpen, setIsOpen] = useState(false);

   const toggleMenu = () => {
      setIsOpen(!isOpen);
   };

   const dispatch = useDispatch<AppDispatch>();

   useEffect(() => {
      dispatch(fetchuser());
   }, [role]);

   return (
      <>
         <button onClick={toggleMenu} className={` fixed top-0  z-50 sm:hidden bg-gray-800 p-3 text-white w-10 `}>
            {isOpen ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faBars} />}
         </button>

         <div
            className={`bg-white h-full w-72 z-20 fixed top-12 sm:top-8 left-0 flex flex-col  shadow-lg transition-transform duration-300 ${
               isOpen ? "translate-x-0" : "-translate-x-full"
            } sm:translate-x-0`}
         >
            <div className="p-4 flex flex-col space-y-4">
               <Link to="/" className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300">
                  <FontAwesomeIcon icon={faHome} className="mr-2 text-gray-700" />
                  Home
               </Link>
               <Link to="/messages" className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300">
                  <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-gray-700" />
                  Messages
               </Link>
               <Link
                  to="/notifications"
                  className="relative flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
               >
                  <FontAwesomeIcon icon={faBell} className="mr-2 text-gray-700" />
                  Notifications
               </Link>

               <Link to="/premium" className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300">
                  <FontAwesomeIcon icon={faCrown} className="mr-2 text-gray-700" />
                  Premium
               </Link>

               <Link to="/profile" className="flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-2 text-gray-700" />
                  My Profile
               </Link>

               <Link
                  to="/polls"
                  className="sidebar-link flex items-center text-gray-700 hover:bg-slate-200 p-2 rounded-md transition-colors duration-300"
               >
                  <i className="fas fa-poll text-gray-700 mr-2"></i>
                  New Poll
               </Link>
            </div>
            <div className="p-4 ">
               <button
                  onClick={() => dispatch(handleCreatePostModal())}
                  className="bg-gray-700 hover:bg-indigo-600 text-white font-semibold py-2 px-4 w-full rounded flex items-center justify-center transition-colors duration-300"
               >
                  <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                  New Post
               </button>
            </div>
         </div>
      </>
   );
}

export default Menu;
