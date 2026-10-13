import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { deleteReplyComment } from "../../service/api";
import toast from "react-hot-toast";
import { fetchAllReplies } from "../../store/actions/post/postActions";

const Replies: FC = () => {
   const replies: any = useSelector((state: RootState) => state?.posts?.comments?.replies);
   const userId: any = useSelector((state: RootState) => state.user.user.userId);

   const dispatch = useDispatch<AppDispatch>();

   const handleReplyDelete = async (id: any, _: number, commentId: any) => {
      try {
         const response = await deleteReplyComment(id);

         if (response?.data?.status === "ok") {
            toast.success(response?.data?.message);
            dispatch(fetchAllReplies(commentId));
         }
      } catch (error: any) {
         toast.error(error?.response?.data?.message);
      }
   };

   return (
      <div className="space-y-2 mt-2">
         {replies?.map((reply: any, i: number) => (
            <div key={reply?._id} className="bg-white/80 border border-slate-200/80 rounded-2xl p-3 shadow-xs">
               <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                     <img
                        src={reply?.userId?.profilePhoto || "https://avatar.iran.liara.run/public"}
                        alt="User Avatar"
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 mt-0.5"
                     />
                     <div>
                        <p className="font-bold text-xs text-slate-900">{reply?.userId?.fullName}</p>
                        <p className="text-xs text-slate-700 mt-0.5 leading-relaxed break-words">{reply?.content}</p>
                     </div>
                  </div>
                  {reply?.userId?._id === userId && (
                     <button
                        onClick={() => handleReplyDelete(reply?._id, i, reply?.commentId)}
                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                     >
                        Delete
                     </button>
                  )}
               </div>
            </div>
         ))}
         {replies?.length <= 0 && (
            <p className="text-xs text-slate-400 py-1 italic">No replies yet</p>
         )}
      </div>
   );
};

export default Replies;
