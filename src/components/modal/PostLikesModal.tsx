import { FC, useEffect, useState } from "react";
import Modal from "react-modal";
import { fetchPostLikedUsers } from "../../service/api";
import { useNavigate } from "react-router-dom";

const PostLikesModal: FC<any> = ({ likesModal, closeLikesModal, postId, likes }) => {
   const [likedUsers, setLikedUsers] = useState<any>([]);

   const navigate = useNavigate();

   useEffect(() => {
      fetchLikedUsers();
   }, [postId, likes]);

   const fetchLikedUsers = async () => {
      try {
         if (postId) {
            const response = await fetchPostLikedUsers(postId);
            setLikedUsers(response?.data?.data);
         } else {
            return;
         }
      } catch (error: any) {}
   };

   const afterOpenModal = () => {
      document.body.style.overflow = "hidden";
   };
   const afterCloseModal = () => {
      document.body.style.overflow = "auto";
   };

   const handleClick = (id: number, email: string) => {
      navigate(`/others-profile?userId=${id}&email=${email}`);
   };

   // const fetchMore = () => {};
   return (
      //   <InfiniteScroll
      //      dataLength={likedUsers.length}
      //      next={() => fetchMore()}
      //      hasMore={hasMore}
      //      loader={
      //         <div className="flex flex-wrap justify-center">
      //            {Array.from({ length: 1 }, (_, i) => (
      //               <div
      //                  key={i}
      //                  className="rounded-lg w-full shadow-md p-6 m-4 hover:shadow-lg transition-shadow duration-300 relative bg-white animate-pulse"
      //               >
      //                  <div className="flex items-center mb-4">
      //                     <div className="profile-photo mr-4">
      //                        <div className="w-16 h-16 rounded-full bg-gray-300"></div>
      //                     </div>
      //                     <div className="flex-grow">
      //                        <div className="user-name">
      //                           <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
      //                           <div className="h-4 bg-gray-300 rounded w-48"></div>
      //                        </div>
      //                     </div>
      //                     <div className="absolute top-2 right-2 flex items-center">
      //                        <div className="h-4 bg-gray-300 rounded w-20 mr-2"></div>
      //                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
      //                     </div>
      //                  </div>
      //               </div>
      //            ))}
      //         </div>
      //      }
      //   >
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         overlayClassName="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden outline-none animate-fade-in"
         isOpen={likesModal}
         onRequestClose={closeLikesModal}
         contentLabel="Post Likes Modal"
         onAfterOpen={afterOpenModal}
         onAfterClose={afterCloseModal}
      >
         {/* Modal Header */}
         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
               <span className="text-rose-500 text-base">❤️</span>
               <h3 className="text-base font-bold text-slate-900">Likes</h3>
               <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {likedUsers?.length || likes || 0}
               </span>
            </div>
            <button
               className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
               onClick={closeLikesModal}
            >
               ✕
            </button>
         </div>

         {/* Liked Users List */}
         <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {likedUsers && likedUsers.length > 0 ? (
               likedUsers?.map((likeItem: any) => (
                  <div
                     key={likeItem?._id}
                     onClick={() => handleClick(likeItem?.userId?._id, likeItem?.userId?.email)}
                     className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                  >
                     <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-slate-100 flex-shrink-0">
                        <img
                           src={likeItem?.userId?.profilePhoto || "https://avatar.iran.liara.run/public"}
                           alt="Profile"
                           className="w-full h-full object-cover"
                        />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate hover:text-orange-600 transition-colors">
                           {likeItem?.userId?.fullName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{likeItem?.userId?.email}</p>
                     </div>
                     <button
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        onClick={(e) => {
                           e.stopPropagation();
                           handleClick(likeItem?.userId?._id, likeItem?.userId?.email);
                        }}
                     >
                        Profile
                     </button>
                  </div>
               ))
            ) : (
               <div className="py-10 text-center text-slate-400 text-sm">
                  <p>No likes yet.</p>
               </div>
            )}
         </div>
      </Modal>
      //   </InfiniteScroll>
   );
};

export default PostLikesModal;
