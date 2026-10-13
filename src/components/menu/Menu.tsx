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
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { handleCreatePostModal } from "../../store/slices/posts/postSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../store/store";
import { fetchuser, logoutAction } from "../../store/actions/auth/userActions";
import socketService from "../../service/socketService";

const socket = socketService.socket;

interface NavItem {
  to: string;
  icon: any;
  label: string;
}

function Menu() {
  const role = useSelector((state: RootState) => state.user.user.auth.role);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    setIsOpen(false);
    dispatch(logoutAction()).then((response) => {
      if (response?.payload?.status === "ok") {
        socket.disconnect();
        navigate("/");
      }
    });
  };

  useEffect(() => {
    dispatch(fetchuser());
  }, [role]);

  const adminLinks: NavItem[] = [
    { to: "/admin/posts", icon: faHome, label: "Home" },
    { to: "/admin", icon: faChartPie, label: "Dashboard" },
    { to: "/admin/reports", icon: faClipboardList, label: "View Reports" },
    { to: "/admin/messages", icon: faCommentDots, label: "Messages" },
    { to: "/admin/notifications", icon: faBell, label: "Notifications" },
    { to: "/admin/profile", icon: faUserCircle, label: "My Profile" },
  ];

  const userLinks: NavItem[] = [
    { to: "/", icon: faHome, label: "Home" },
    { to: "/messages", icon: faCommentDots, label: "Messages" },
    { to: "/notifications", icon: faBell, label: "Notifications" },
    { to: "/premium", icon: faCrown, label: "Premium" },
    { to: "/profile", icon: faUserCircle, label: "My Profile" },
    { to: "/polls", icon: faClipboardList, label: "New Poll" },
  ];

  const links = role === "admin" ? adminLinks : userLinks;
  const isOnPostPage =
    location?.pathname === "/" || location?.pathname === "/admin/posts";

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    if (to === "/admin")
      return location.pathname === "/admin" || location.pathname === "/admin/";
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleMenu}
        className="fixed top-3 left-3 z-50 sm:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
        style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}
      >
        <FontAwesomeIcon
          icon={isOpen ? faTimes : faBars}
          className="text-white text-sm"
        />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-14 left-0 h-[calc(100vh-56px)] w-64 z-20 flex flex-col transition-transform duration-300 ease-in-out bg-white border-r border-slate-200/80 shadow-xs ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
      >
        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {links.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                    active
                      ? "text-orange-600 bg-orange-50/80 font-bold border-l-[3px] border-orange-500 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      active
                        ? "text-white shadow-xs"
                        : "text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100"
                    }`}
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(135deg, #F97316, #EA580C)",
                          }
                        : {}
                    }
                  >
                    <FontAwesomeIcon icon={link.icon} className="text-sm" />
                  </div>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {isOnPostPage && (
            <button
              onClick={() => dispatch(handleCreatePostModal())}
              className="w-full flex items-center justify-center gap-2.5 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-orange-500/20"
              style={{
                background: "linear-gradient(135deg, #F97316, #EA580C)",
              }}
            >
              <FontAwesomeIcon icon={faPlusCircle} className="text-base" />
              New Post
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100/80 text-slate-400 group-hover:text-rose-600 transition-all">
              <FontAwesomeIcon icon={faSignOutAlt} className="text-sm" />
            </div>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Menu;
