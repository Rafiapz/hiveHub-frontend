import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { repostPost } from "../../service/api";
import toast from "react-hot-toast";
import { fetchAllposts } from "../../store/actions/post/postActions";

const SharePost: FC<any> = ({ modalIsOpen, closeModal }) => {
   const post: any = useSelector((state: RootState) => state?.posts?.sharePost?.data);
   const userId = useSelector((state: RootState) => state?.user?.user?.userId);

   const dispatch = useDispatch<AppDispatch>();

   const handleRepost = async () => {
      try {
         const form = new FormData();

         form.append("userId", userId || "");
         form?.append("postId", post?._id);
         const response = await repostPost(form);
         if (response?.data?.status === "ok") {
            toast.success("Successfully shared the post");
            dispatch(fetchAllposts({}));
         }
      } catch (error) {
         toast.error("Failed to share the post");
         console.error("Error reposting post:", error);
      }
      closeModal();
   };

   return (
      <div className="bg-white rounded-lg shadow-md p-4">
         <p className="text-gray-800">{post?.content}</p>

         {modalIsOpen && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
               <div className="flex items-center justify-center min-h-screen">
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

                  <div className="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
                     <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                           <h3 className="text-lg leading-6 font-medium text-gray-900">Repost Confirmation</h3>
                           <div className="mt-2">
                              <p className="text-sm text-gray-500">Are you sure you want to repost the post?</p>
                              <div className="mt-4">
                                 <p className="text-sm text-gray-800">{post?.content}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                           type="button"
                           className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                           onClick={handleRepost}
                        >
                           Repost
                        </button>
                        <button
                           type="button"
                           className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                           onClick={closeModal}
                        >
                           Cancel
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default SharePost;
