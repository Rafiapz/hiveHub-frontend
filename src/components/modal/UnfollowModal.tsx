import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import { AppDispatch, RootState } from "../../store/store";
import { handleUnfollowModal } from "../../store/slices/network/networkSlice";
import { FC } from "react";
import { fetchAllNetworks, fetchFollwing, unFollow } from "../../store/actions/network/networkActions";
import toast from "react-hot-toast";
import { fetchAllUsers } from "../../store/actions/auth/userActions";

const UnfollowModal: FC = () => {
   const isOpen = useSelector((state: RootState) => state?.networks?.followers?.modal);
   const curId: number = useSelector((state: RootState) => state?.networks?.followers?.curId);
   const dispatch = useDispatch<AppDispatch>();

   if (!isOpen) {
      document.body.style.overflow = "auto";
      return;
   } else {
      document.body.style.overflow = "hidden";
   }

   const handleModal = (status: boolean) => {
      dispatch(handleUnfollowModal({ status }));
   };

   const handleUnfollow = () => {
      console.log(curId);

      dispatch(unFollow(curId))
         .then((response) => {
            if (response?.payload?.status === "ok") {
               toast.success("Successfully unfollowed");
               dispatch(fetchFollwing());
               dispatch(fetchAllUsers());
               dispatch(fetchAllNetworks());
            }
            dispatch(handleUnfollowModal({ status: false }));
         })
         .catch((err) => {
            console.log(err);
         });
   };

   return (
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         isOpen={isOpen}
         onRequestClose={() => {
            handleModal(false);
         }}
         overlayClassName="modal-bg-overlay"
         className="bg-white w-1/3
                 flex flex-col items-center  justify-center py-4 shadow-xl rounded-md fixed top-1/2 left-1/2 transform translate-x-[-50%] translate-y-[-50%]"
      >
         <h2 className="text-lg font-semibold mb-1">Confirm Unfollow</h2>
         <p className="mb-6">Are you sure you want to Unfollow the user ?</p>
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
               onClick={() => handleUnfollow()}
               className="px-4 py-1 text-black bg-red-500 hover:bg-red-700 hover:text-white border border-black rounded"
            >
               Unfollow
            </button>
         </div>
      </Modal>
   );
};

export default UnfollowModal;
