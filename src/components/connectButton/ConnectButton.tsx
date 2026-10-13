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
      <button
         onClick={() => handleConnect(id)}
         className="flex items-center gap-1 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
         style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
      >
         <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
         </svg>
         <span>{content}</span>
      </button>
   );
}

export default ConnectButton;
