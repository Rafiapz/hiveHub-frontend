import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { repostPost } from "../../service/api";
import toast from "react-hot-toast";
import { fetchAllposts } from "../../store/actions/post/postActions";
import { updatePostShares } from "../../store/slices/posts/postSlice";

const SharePost: FC<any> = ({ modalIsOpen, closeModal }) => {
   const post: any = useSelector((state: RootState) => state?.posts?.sharePost?.data);
   const userId = useSelector((state: RootState) => state?.user?.user?.userId);

   const dispatch = useDispatch<AppDispatch>();

   const handleRepost = async () => {
      try {
         const form = new FormData();

         form.append("userId", userId || "");
         form.append("postId", post?._id);
         const response = await repostPost(form);
         if (response?.data?.status === "ok") {
            toast.success("Successfully shared the post");
            const newShares = response?.data?.updatedShares ?? ((post?.shares || 0) + 1);
            dispatch(updatePostShares({ postId: post?._id, shares: newShares }));
            dispatch(fetchAllposts({ page: 1 }));
         }
      } catch (error) {
         toast.error("Failed to share the post");
         console.error("Error reposting post:", error);
      }
      closeModal();
   };

   if (!modalIsOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
         />

         <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-md w-full z-50 animate-fade-in">
            <div className="text-center sm:text-left">
               <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl mb-4 mx-auto sm:mx-0 shadow-xs">
                  🔄
               </div>
               <h3 className="text-lg font-bold text-slate-900">Repost to Your Feed</h3>
               <p className="text-xs text-slate-500 mt-1">Share this post with your followers and community.</p>

               {post?.content && (
                  <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left">
                     <p className="text-xs font-bold text-slate-700 mb-1">{post?.userId?.fullName || "Post author"}</p>
                     <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{post?.content}</p>
                  </div>
               )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
               <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  onClick={closeModal}
               >
                  Cancel
               </button>
               <button
                  type="button"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
                  onClick={handleRepost}
               >
                  Repost Now
               </button>
            </div>
         </div>
      </div>
   );
};

export default SharePost;
