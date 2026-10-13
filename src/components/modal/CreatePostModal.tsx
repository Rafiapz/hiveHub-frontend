import CreatePost from "../post/CreatePost";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { handleCreatePostModal } from "../../store/slices/posts/postSlice";

function CreatePostModal() {
   const isOpen = useSelector((state: RootState) => state.posts.createPostModal.isOpen);
   const dispatch = useDispatch();

   if (!isOpen) {
      document.body.style.overflow = "auto";
      return null;
   } else {
      document.body.style.overflow = "hidden";
   }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => dispatch(handleCreatePostModal())}
         />
         <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <CreatePost />
         </div>
      </div>
   );
}

export default CreatePostModal;
