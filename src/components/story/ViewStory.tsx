import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import Modal from "react-modal";
import { deleteStory, fetchAllStories, storySeen } from "../../store/actions/post/postActions";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faChevronLeft,
   faChevronRight,
   faTimes,
   faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "timeago.js";

interface ViewStoryProps {
   modalIsOpen: boolean;
   closeModal: () => void;
}

const ViewStory: React.FC<ViewStoryProps> = ({ modalIsOpen, closeModal }) => {
   const stories: any = useSelector((state: RootState) => state?.posts?.stories?.data);
   const storyIndex: any = useSelector((state: RootState) => state?.posts?.stories?.index);
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);

   const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(storyIndex || 0);
   const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

   useEffect(() => {
      if (typeof storyIndex === "number") {
         setCurrentStoryIndex(storyIndex);
         setCurrentImageIndex(0);
      }
   }, [storyIndex]);

   const currentStory = stories?.[currentStoryIndex];
   const mediaList = currentStory?.media || [];

   const dispatch = useDispatch<AppDispatch>();

   const handlePrevStory = () => {
      if (!stories || stories.length === 0) return;
      if (currentStoryIndex > 0) {
         const newIdx = currentStoryIndex - 1;
         setCurrentStoryIndex(newIdx);
         setCurrentImageIndex(0);
         markSeen(stories[newIdx]);
      }
   };

   const handleNextStory = () => {
      if (!stories || stories.length === 0) return;
      if (currentStoryIndex < stories.length - 1) {
         const newIdx = currentStoryIndex + 1;
         setCurrentStoryIndex(newIdx);
         setCurrentImageIndex(0);
         markSeen(stories[newIdx]);
      } else {
         closeModal();
      }
   };

   const markSeen = (storyItem: any) => {
      if (storyItem?._id) {
         const form = new FormData();
         form.append("userId", userId);
         form.append("storyId", storyItem._id);
         dispatch(storySeen(form));
         dispatch(fetchAllStories(userId));
      }
   };

   const handlePrevImage = () => {
      if (currentImageIndex > 0) {
         setCurrentImageIndex(currentImageIndex - 1);
      } else {
         handlePrevStory();
      }
   };

   const handleNextImage = () => {
      if (currentImageIndex < mediaList.length - 1) {
         setCurrentImageIndex(currentImageIndex + 1);
      } else {
         handleNextStory();
      }
   };

   const handleDeleteStory = (image: any) => {
      if (!currentStory?._id) return;
      const form = new FormData();
      form.append("storyId", currentStory._id);
      form.append("image", image);

      dispatch(deleteStory(form))
         .then(() => {
            toast.success("Story deleted");
            dispatch(fetchAllStories(userId));
            closeModal();
         })
         .catch(() => {
            toast.error("Failed to delete story");
         });
   };

   if (!currentStory) return null;

   const author = currentStory?.userId;
   const isMyStory = author?._id === userId;

   return (
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         overlayClassName="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 outline-none"
         className="relative w-full max-w-sm sm:max-w-md h-[88vh] max-h-[760px] rounded-3xl overflow-hidden bg-slate-950 shadow-2xl flex flex-col justify-between outline-none select-none border border-white/10 animate-in fade-in zoom-in-95 duration-200"
         isOpen={modalIsOpen}
         onRequestClose={closeModal}
         contentLabel="View Story"
      >
         {/* Top Overlay: Progress Segments & Author Header */}
         <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {/* Segmented Progress Bars */}
            <div className="flex items-center gap-1.5 mb-3">
               {mediaList.map((_: any, idx: number) => {
                  const isDone = idx < currentImageIndex;
                  const isCurrent = idx === currentImageIndex;
                  return (
                     <div
                        key={idx}
                        className="h-1 flex-1 rounded-full overflow-hidden bg-white/30 backdrop-blur-xs"
                     >
                        <div
                           className={`h-full transition-all duration-300 ${
                              isDone || isCurrent ? "w-full bg-white" : "w-0"
                           }`}
                        />
                     </div>
                  );
               })}
            </div>

            {/* Author Header Row */}
            <div className="flex items-center justify-between text-white">
               <div className="flex items-center gap-2.5">
                  <img
                     src={author?.profilePhoto || "/placeholder-avatar.png"}
                     alt={author?.fullName || "User"}
                     className="w-9 h-9 rounded-full object-cover ring-2 ring-white/60 shadow-sm"
                     onError={(e: any) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                           author?.fullName || "User"
                        )}&background=F97316&color=fff`;
                     }}
                  />
                  <div>
                     <h4 className="text-sm font-bold leading-tight">
                        {author?.fullName || "HiveHub Member"}
                     </h4>
                     <p className="text-[11px] text-white/70">
                        {format(currentStory?.createdAt || Date.now())}
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  {isMyStory && (
                     <button
                        onClick={() => handleDeleteStory(mediaList[currentImageIndex])}
                        className="w-8 h-8 rounded-full bg-black/40 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                        title="Delete this story"
                     >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                     </button>
                  )}
                  <button
                     onClick={closeModal}
                     className="w-8 h-8 rounded-full bg-black/40 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                     title="Close story"
                  >
                     <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>
               </div>
            </div>
         </div>

         {/* Center Media */}
         <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
            {mediaList[currentImageIndex] && (
               <img
                  src={mediaList[currentImageIndex]}
                  alt="Story content"
                  className="w-full h-full object-cover"
               />
            )}

            {/* Click zones for navigation */}
            <div className="absolute inset-0 flex z-20">
               <div
                  className="w-1/3 h-full cursor-pointer"
                  onClick={handlePrevImage}
                  title="Previous"
               />
               <div
                  className="w-2/3 h-full cursor-pointer"
                  onClick={handleNextImage}
                  title="Next"
               />
            </div>
         </div>

         {/* Desktop Outer Floating Navigation Arrows */}
         {currentStoryIndex > 0 && (
            <button
               onClick={handlePrevStory}
               className="hidden sm:flex absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 text-white items-center justify-center backdrop-blur-md transition-all shadow-lg z-40"
               title="Previous story"
            >
               <FontAwesomeIcon icon={faChevronLeft} />
            </button>
         )}

         {currentStoryIndex < stories?.length - 1 && (
            <button
               onClick={handleNextStory}
               className="hidden sm:flex absolute -right-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 text-white items-center justify-center backdrop-blur-md transition-all shadow-lg z-40"
               title="Next story"
            >
               <FontAwesomeIcon icon={faChevronRight} />
            </button>
         )}
      </Modal>
   );
};

export default ViewStory;
