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
      <>
         {replies?.map((reply: any, i: number) => (
            <div key={reply?._id} className="bg-gray-100 border border-gray-300 rounded p-4 mt-2">
               <div className="flex items-center mb-4">
                  <img src={reply?.userId?.profilePhoto} alt="User Avatar" className="w-8 h-8 rounded-full mr-2" />
                  <div>
                     <p className="font-semibold">{reply?.userId?.fullName}</p>
                     <p className="font-sans ml-1">{reply?.content}</p>
                  </div>
                  <div className="ml-auto flex items-center">
                     {" "}
                     {/* Container for delete button and three dots */}
                     {reply?.userId?._id === userId && ( // Show delete button logic
                        <div className="mr-2">
                           {" "}
                           {/* Added margin to the right */}
                           <button onClick={() => handleReplyDelete(reply?._id, i, reply?.commentId)} className="text-red-500 hover:text-red-700">
                              Delete
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         ))}
         {replies?.length <= 0 && <p className="ml-10">No replies</p>}
      </>
   );
};

export default Replies;
