import Searchbox from "../search/Searchbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHexagonNodes, faCrown, faBell } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const auth = useSelector((state: RootState) => state?.user?.user?.auth?.isAuth);
   const navigate = useNavigate();

   return (
      <header className="fixed z-30 top-0 left-0 w-full h-14 px-4 sm:px-6 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
         {/* Logo */}
         <Link to="/" className="flex items-center gap-2.5 ml-2 sm:ml-0 group transition-transform active:scale-95">
            <div
               className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform"
               style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
            >
               <FontAwesomeIcon icon={faHexagonNodes} className="text-white text-sm" />
            </div>
            <h1 className="text-slate-900 font-black text-xl sm:text-2xl tracking-tight">
               hive<span style={{ color: '#F97316' }}>Hub</span>
            </h1>
         </Link>

         {/* Mobile search */}
         <div className="sm:hidden flex-1 px-3 max-w-xs">
            <Searchbox />
         </div>

         {/* Desktop Right Quick Actions & User Pill */}
         {auth && (
            <div className="hidden sm:flex items-center gap-2.5">
               <Link
                  to="/notifications"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all relative"
                  title="Notifications"
               >
                  <FontAwesomeIcon icon={faBell} className="text-sm" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
               </Link>

               <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all duration-200 group shadow-2xs"
               >
                  <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-orange-500/40 bg-slate-100 flex-shrink-0">
                     <img
                        src={userData?.profilePhoto || "/placeholder-avatar.png"}
                        alt={userData?.fullName || "Profile"}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                           e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              userData?.fullName || "User"
                           )}&background=F97316&color=fff&size=100`;
                        }}
                     />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 max-w-[120px] truncate">
                     {userData?.fullName?.split(" ")[0] || "Profile"}
                  </span>
                  {userData?.premium && (
                     <FontAwesomeIcon icon={faCrown} className="text-amber-500 text-xs flex-shrink-0" title="Premium" />
                  )}
               </button>
            </div>
         )}
      </header>
   );
};

export default Header;
