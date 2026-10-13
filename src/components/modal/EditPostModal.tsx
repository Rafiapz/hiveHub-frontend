import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import EditPost from "../post/EditPost";
import { FC } from "react";
import { handleEditPostModal } from "../../store/slices/posts/postSlice";

const EditPostModal: FC<any> = ({ items, setItems }) => {
   const isOpen = useSelector((state: RootState) => state.posts.editPostModal.isOpen);
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
            onClick={() => dispatch(handleEditPostModal({ status: false }))}
         />
         <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <EditPost items={items} setItems={setItems} />
         </div>
      </div>
   );
};

export default EditPostModal;
