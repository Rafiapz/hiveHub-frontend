import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import Modal from "react-modal";
import { deleteStory, fetchAllStories, storySeen } from "../../store/actions/post/postActions";
import toast from "react-hot-toast";

const ViewStory: React.FC<{ modalIsOpen: boolean; closeModal: () => void }> = ({ modalIsOpen, closeModal }) => {
   const stories: any = useSelector((state: RootState) => state?.posts?.stories?.data);
   const storyIndex: any = useSelector((state: RootState) => state?.posts?.stories?.index);
   const userId: any = useSelector((state: RootState) => state.user.user.userId);

   const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(storyIndex);
   const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

   useEffect(() => {
      setCurrentStoryIndex(storyIndex);
   }, [storyIndex]);

   const currentStory = stories?.[currentStoryIndex];

   const dispatch = useDispatch<AppDispatch>();

   const handlePrevStory = () => {
      if (!stories || stories.length === 0) return;
      setCurrentStoryIndex((prevIndex: number) => (prevIndex !== 0 ? prevIndex - 1 : 0));
      setCurrentImageIndex(0);

      const form = new FormData();
      form.append("userId", userId);
      form.append("storyId", currentStory?._id);
      dispatch(storySeen(form));
      dispatch(fetchAllStories(userId));
   };

   const handleNextStory = () => {
      if (!stories || stories.length === 0) return;
      setCurrentStoryIndex((prevIndex) => (prevIndex !== stories?.length - 1 ? prevIndex + 1 : prevIndex));
      setCurrentImageIndex(0);

      const form = new FormData();
      form.append("userId", userId);
      form.append("storyId", currentStory?._id);
      dispatch(storySeen(form));
      dispatch(fetchAllStories(userId));
   };

   const handlePrevImage = () => {
      if (!currentStory?.media) return;
      setCurrentImageIndex((prevIndex) => (prevIndex !== 0 ? prevIndex - 1 : 0));
   };

   const handleNextImage = () => {
      if (!currentStory?.media) return;
      setCurrentImageIndex((prevIndex: number) => {
         if (prevIndex + 1 <= currentStory?.media?.length - 1) {
            return prevIndex + 1;
         } else {
            return 0;
         }
      });
   };

   const handleDeleteStory = (image: any) => {
      const form = new FormData();

      form.append("storyId", currentStory?._id);
      form.append("image", image);

      dispatch(deleteStory(form))
         .then(() => {
            toast.success("Story deleted");
            dispatch(fetchAllStories(userId));
         })
         .catch(() => {
            toast.error("Failed to delete story");
         });
   };

   return (
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         overlayClassName="modal-bg-overlay"
         className="bg-white  py-4 shadow-xl w-4/5 sm:w-auto rounded-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
         isOpen={modalIsOpen}
         onRequestClose={closeModal}
         contentLabel="Stories"
      >
         <div className="bg-white rounded-lg h-auto shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
               <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full"
                  onClick={handlePrevStory}
                  disabled={!stories || stories.length === 0}
               >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
               </button>
               <p className="text-center text-sm">{currentStory?.userId?.fullName}</p>
               <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full"
                  onClick={handleNextStory}
                  disabled={!stories || stories.length === 0}
               >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
               </button>
            </div>
            {currentStory && (
               <div className="mt-4">
                  <div className="relative">
                     <img
                        src={currentStory?.media[currentImageIndex]}
                        alt={`${currentStory?.userId?.fullName}'s story`}
                        className="w-full h-96 object-cover"
                     />
                     <div className="absolute inset-0">
                        {currentStory?.userId?._id === userId && (
                           <button
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded absolute top-2 right-2"
                              onClick={() => handleDeleteStory(currentStory?.media[currentImageIndex])}
                           >
                              Delete
                           </button>
                        )}

                        <div className="flex items-center justify-between px-4 absolute bottom-0 left-0 right-0">
                           <button
                              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full"
                              onClick={handlePrevImage}
                              disabled={!currentStory?.media}
                           >
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                           </button>
                           <button
                              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full"
                              onClick={handleNextImage}
                              disabled={!currentStory?.media}
                           >
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </Modal>
   );
};
export default ViewStory;
