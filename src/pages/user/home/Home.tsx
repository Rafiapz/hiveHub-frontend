import { FC, Suspense, lazy, useEffect, useState } from "react";

const Menu = lazy(() => import("../../../components/menu/Menu"));
const Story = lazy(() => import("../../../components/story/Story"));
const RightSideBar = lazy(() => import("../../../components/rightSideBar/RightSideBar"));
const Posts = lazy(() => import("../../../components/post/Posts"));
const CreatePostModal = lazy(() => import("../../../components/modal/CreatePostModal"));
const EditPostModal = lazy(() => import("../../../components/modal/EditPostModal"));
const Comments = lazy(() => import("../../../components/comments/Comments"));
const ReportPost = lazy(() => import("../../../components/reportPost/ReportPost"));
const ViewStory = lazy(() => import("../../../components/story/ViewStory"));
const SharePost = lazy(() => import("../../../components/share/SharePost"));
const Poll = lazy(() => import("../../../components/Polls/Poll"));
import Popup from "../../../components/notification/Popup";
import socketService from "../../../service/socketService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import LoadingFalBack from "../../../components/loading/LoadingFalBack";
import Header from "../../../components/header/Header";

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
               <Suspense fallback={<LoadingFalBack />}>
                  <Menu />
               </Suspense>
               <Header />
               <div className="mt-8"></div>
               <Suspense fallback={<LoadingFalBack />}>
                  <Posts openModal={openModal} openSharePostModal={openSharePostModal} />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <CreatePostModal />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <EditPostModal />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <ReportPost modalIsOpen={modalIsOpen} openModal={openModal} closeModal={closeModal} />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <Comments />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <ViewStory modalIsOpen={storyViewing} closeModal={handleStoryView} />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <RightSideBar />
               </Suspense>
            </div>
         ) : (
            <div className="bg-gray-100 overflow-scroll">
               <Suspense fallback={<LoadingFalBack />}>
                  <Menu />
               </Suspense>
               <Header />
               <Suspense fallback={<LoadingFalBack />}>
                  <Story setView={setStoryViewing} />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <Poll />
               </Suspense>
               <Popup notification={notified} data={notificationData} />
               <Suspense fallback={<LoadingFalBack />}>
                  <Posts openModal={openModal} openSharePostModal={openSharePostModal} />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <CreatePostModal />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <ReportPost modalIsOpen={modalIsOpen} openModal={openModal} closeModal={closeModal} />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <Comments />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <ViewStory modalIsOpen={storyViewing} closeModal={handleStoryView} />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <SharePost modalIsOpen={sharePostModalIsOpen} closeModal={closeSharePostModal} />
               </Suspense>
               <Suspense fallback={<LoadingFalBack />}>
                  <RightSideBar />
               </Suspense>
            </div>
         )}
      </>
   );
};

export default Home;
