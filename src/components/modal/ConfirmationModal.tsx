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
         className="bg-white w-1/3
                flex flex-col items-center justify-center py-4 shadow-xl rounded-md fixed top-1/2 left-1/2 transform translate-x-[-50%] translate-y-[-50%]"
      >
         <h2 className="text-lg font-semibold mb-1">Confirm Delete</h2>
         <p className="mb-6">Are you sure you want to delete ?</p>
         <div className="flex items-center justify-center gap-4">
            <button
               onClick={() => {
                  handleModal(false);
               }}
               className="px-4 py-1 text-black border hover:bg-gray-300 border-black rounded"
            >
               Cancel
            </button>
            <button
               onClick={() => {
                  handleDelete(curId);
               }}
               className="px-4 py-1 text-black bg-red-500 hover:bg-red-700 hover:text-white border border-black rounded"
            >
               Delete
            </button>
         </div>
      </Modal>
   );
}

export default ConfirmationModal;
