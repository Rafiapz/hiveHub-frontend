import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Signup from "./pages/auth/signup/Signup";
import Home from "./pages/user/home/Home";
import Login from "./pages/auth/login/Login";
import Verification from "./pages/auth/verification/Verification";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import { fetchuser } from "./store/actions/auth/userActions";
import Profile from "./pages/user/profile/Profile";
import EditProfile from "./pages/user/profile/EditProfile";
import ForgotPassword from "./components/forgotPassword/ForgotPassword";
import ResetPassword from "./pages/auth/login/resetPassword/ResetPassword";
import UserPosts from "./components/activity/UsersPosts";
import Following from "./components/networks/Following";
import Followers from "./components/networks/Followers";
import OthersProfile from "./pages/user/othersProfile/OthersProfile";
import OthersProfilePosts from "./components/othersProfilePost/OthersProfilePosts";
import UsersLikes from "./components/likes/UsersLikes";
import Messages from "./pages/message/Messages";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import BlockedUser from "./components/blockedUser/BlockedUser";
import Reports from "./pages/admin/reports/Reports";
import Notifications from "./pages/user/notifications/Notifications";
import Premium from "./pages/user/premium/Premium";
import PollPage from "./pages/user/polls/PollPage";
import socketService from "../src/service/socketService";
import UsersPoll from "./components/Polls/UsersPolls";
const socket = socketService.socket;

function App() {
   const auth = useSelector((state: RootState) => state?.user?.user?.auth?.isAuth);
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const dispatch = useDispatch<AppDispatch>();
   const userId = useSelector((state: RootState) => state?.user?.user?.userId);

   useEffect(() => {
      dispatch(fetchuser());
   }, []);

   useEffect(() => {
      if (userId) {
         socket.emit("addUser", userId);
      }
   }, [userId]);

   return (
      <>
         <Toaster position="top-center" containerClassName="text-red-500" />
         {!auth ? (
            <>
               <Routes>
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/" element={<Login />} />
                  <Route path="/verification" element={<Verification />} />
                  <Route path="/profile" element={<Login />} />
                  <Route path="/edit-profile" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/others-profile" element={<Login />} />
                  <Route path="/dashboard" element={<Login />} />
                  <Route path="/messages" element={<Login />} />
                  <Route path="/admin" element={<Login />} />
                  <Route path="/admin/reports" element={<Login />} />
               </Routes>
            </>
         ) : (
            <>
               {userData && userData?.isBlocked === true ? (
                  <BlockedUser />
               ) : (
                  <>
                     {userData?.role === "admin" && (
                        <Routes>
                           <Route path="/" element={<Navigate to={"/admin"} />} />
                           <Route path="/admin/">
                              <Route index element={<Dashboard />} />
                              <Route path="reports" element={<Reports />} />
                              <Route path="notifications" element={<Notifications />} />
                              <Route path="messages" element={<Messages />} />
                              <Route path="polls" element={<PollPage />} />
                              <Route path="posts" element={<Home />} />
                              <Route path="profile" element={<Profile />}>
                                 <Route index element={<UserPosts />} />
                                 <Route path={`profile/polls`} element={<UsersPoll />} />
                                 <Route path="profile/following" element={<Following />} />
                                 <Route path="profile/followers" element={<Followers />} />
                                 <Route path="profile/likes" element={<UsersLikes />} />
                              </Route>
                           </Route>
                        </Routes>
                     )}
                     <Routes>
                        <Route path="/" element={userData?.role === "admin" ? <Navigate to={"/admin"} /> : <Home />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/direct" />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/premium" element={<Premium />} />
                        <Route path="/polls" element={<PollPage />} />
                        <Route path="/profile" element={<Profile />}>
                           <Route index element={<UserPosts />} />
                           <Route path={`/profile/polls`} element={<UsersPoll />} />
                           <Route path="/profile/following" element={<Following />} />
                           <Route path="/profile/followers" element={<Followers />} />
                           <Route path="/profile/likes" element={<UsersLikes />} />
                        </Route>
                        <Route path="/edit-profile" element={<EditProfile />} />
                        <Route path="/others-profile" element={<OthersProfile />}>
                           <Route index element={<OthersProfilePosts />} />
                           <Route path="/others-profile/polls" element={<UsersPoll />} />
                        </Route>
                     </Routes>
                  </>
               )}
            </>
         )}
      </>
   );
}
export default App;
