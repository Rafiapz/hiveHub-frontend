import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { confirmationModalReducer } from "../../store/slices/user/userSlice";
import "./ConfirmModal.css";

function ConfirmationModal({ handleDelete, curId }: any) {
   const isOpen = useSelector((state: RootState) => state.user.confirmationModal.isOpen);
   const dispatch = useDispatch<AppDispatch>();

   if (!isOpen) {
      document.body.style.overflow = "auto";
      return;
   } else {
      document.body.style.overflow = "hidden";
   }

   const handleModal = (status: boolean) => {
      dispatch(confirmationModalReducer({ status }));
   };

   return (
      <Modal
         isOpen={isOpen}
         onRequestClose={() => {
            handleModal(false);
         }}
         overlayClassName="modal-bg-overlay"
         className="bg-white w-full max-w-sm mx-4 flex flex-col items-center text-center p-6 shadow-2xl rounded-3xl border border-slate-100 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none animate-fade-in"
      >
         <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-4 shadow-xs">
            🗑️
         </div>
         <h2 className="text-lg font-bold text-slate-900 mb-1">Confirm Deletion</h2>
         <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Are you sure you want to delete this? This action cannot be reversed.
         </p>
         <div className="flex items-center justify-center gap-2.5 w-full">
            <button
               onClick={() => {
                  handleModal(false);
               }}
               className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
               Cancel
            </button>
            <button
               onClick={() => {
                  handleDelete(curId);
               }}
               className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-all"
            >
               Delete
            </button>
         </div>
      </Modal>
   );
}

export default ConfirmationModal;
