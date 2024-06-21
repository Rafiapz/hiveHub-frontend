import { FC, useEffect, useState } from "react";
import Popup from "../../../components/notification/Popup";
import socketService from "../../../service/socketService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import Header from "../../../components/header/Header";
import VideoCall from "../../../components/videoCall/VideoCall";

import Posts from "../../../components/post/Posts";
import CreatePostModal from "../../../components/modal/CreatePostModal";
import EditPostModal from "../../../components/modal/EditPostModal";
import ReportPost from "../../../components/reportPost/ReportPost";
import Comments from "../../../components/comments/Comments";
import ViewStory from "../../../components/story/ViewStory";
import RightSideBar from "../../../components/rightSideBar/RightSideBar";
import Story from "../../../components/story/Story";
import Poll from "../../../components/Polls/Poll";
import SharePost from "../../../components/share/SharePost";
import Menu from "../../../components/menu/Menu";

const socket = socketService.socket;

const Home: FC = () => {
   const [modalIsOpen, setIsOpen] = useState(false);
   const [storyViewing, setStoryViewing] = useState<boolean>(false);
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const [sharePostModalIsOpen, setSharePostModalIsOpen] = useState(false);
   const userId: any = useSelector((state: RootState) => state.user.user.userId);
   const [notified, setNotified] = useState<boolean>(false);
   const [notificationData, setNotificationData] = useState<any>(null);

   useEffect(() => {
      const getNotifiationEvent = (data: any) => {
         if (data?.senderId !== userId) {
            setNotificationData(data);
            setNotified(true);
         }
      };
      socket.on("getNotifiation", getNotifiationEvent);
      return () => {
         socket.off("getNotifiation", getNotifiationEvent);
      };
   }, [socket]);

   const openModal = () => {
      setIsOpen(true);
   };
   const closeModal = () => {
      setIsOpen(false);
   };

   const handleStoryView = () => {
      setStoryViewing(false);
   };

   const openSharePostModal = () => {
      setSharePostModalIsOpen(true);
   };

   const closeSharePostModal = () => {
      setSharePostModalIsOpen(false);
   };

   return (
      <>
         {userData?.role === "admin" ? (
            <div className="bg-gray-100 ">
               <Menu />

               <Header />
               <div className="mt-8"></div>

               <Posts openModal={openModal} openSharePostModal={openSharePostModal} />

               <CreatePostModal />

               <EditPostModal />

               <ReportPost modalIsOpen={modalIsOpen} openModal={openModal} closeModal={closeModal} />

               <Comments />

               <ViewStory modalIsOpen={storyViewing} closeModal={handleStoryView} />

               <RightSideBar />
            </div>
         ) : (
            <div className="bg-gray-100 overflow-scroll">
               <Menu />

               <Header />

               <Story setView={setStoryViewing} />

               <Poll />

               <Popup notification={notified} data={notificationData} />

               <Posts openModal={openModal} openSharePostModal={openSharePostModal} />

               <CreatePostModal />

               <ReportPost modalIsOpen={modalIsOpen} openModal={openModal} closeModal={closeModal} />

               <Comments />

               <ViewStory modalIsOpen={storyViewing} closeModal={handleStoryView} />

               <SharePost modalIsOpen={sharePostModalIsOpen} closeModal={closeSharePostModal} />

               <RightSideBar />

               <VideoCall />
            </div>
         )}
      </>
   );
};

export default Home;
