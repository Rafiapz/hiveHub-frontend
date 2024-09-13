import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { connectionRequestAction, fetchAllNetworks, fetchFollwing } from "../../store/actions/network/networkActions";
import toast from "react-hot-toast";

function ConnectButton({ id, content }: any) {
   const userId = useSelector((state: RootState) => state?.user?.user?.userId);
   const dispatch = useDispatch<AppDispatch>();

   const handleConnect = (targetId: number) => {
      dispatch(connectionRequestAction({ targetId, userId }))
         .then((response) => {
            if (response.payload.status === "ok") {
               dispatch(fetchAllNetworks());
               toast(response?.payload?.message, {
                  style: { backgroundColor: "#4caf50", color: "white" },
               });
               dispatch(fetchFollwing());
            } else {
               toast.error(response?.payload?.message);
            }
         })
         .catch((err) => {
            toast.error(err?.response?.payload?.message);
         });
   };

   return (
      <div className="flex justify-center">
         <div className="flex items-center font-medium">
            <button
               onClick={() => handleConnect(id)}
               className="flex items-center bg-orange-400 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors duration-300"
            >
               <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
               <span>{content}</span>
            </button>
         </div>
      </div>
   );
}

export default ConnectButton;
