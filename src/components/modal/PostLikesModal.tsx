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
         overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
         className=" bg-white rounded-lg shadow-xl w-1/3 h-2/3 max-h-screen"
         isOpen={likesModal}
         onRequestClose={closeLikesModal}
         contentLabel="Report Post Modal"
         onAfterOpen={afterOpenModal}
         onAfterClose={afterCloseModal}
      >
         <div className="p-6 flex flex-col h-full">
            <div className="mb-4">
               <div className="flex items-center justify-between ">
                  {/* <h2 className="text-xl font-semibold ml-40 text-gray-800">New Message</h2> */}
                  <h2></h2>
                  <button className="text-gray-600 hover:text-gray-800 focus:outline-none" onClick={closeLikesModal}>
                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
            </div>
            <div className="overflow-y-auto">
               <div className="flex flex-col overflow-hidden">
                  {likedUsers?.map((likes: any) => (
                     <div
                        key={likes?._id}
                        className="user-card bg-white rounded-lg w-full shadow-md p-3 m-4 h-20 hover:shadow-lg transition-shadow duration-300"
                     >
                        <div className="flex items-center mb-4" onClick={() => handleClick(likes?.userId?._id, likes?.userId?.email)}>
                           <div className="profile-photo mr-4 hover:cursor-pointer">
                              <img src={likes?.userId?.profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                           </div>
                           <div className="user-name hover:cursor-pointer">
                              <h1 className="text-lg font-semibold">{likes?.userId?.fullName}</h1>
                              <h5>{likes?.userId?.email}</h5>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </Modal>
      //   </InfiniteScroll>
   );
};

export default PostLikesModal;
