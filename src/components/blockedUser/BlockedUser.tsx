import { useDispatch } from "react-redux";
import { logoutAction } from "../../store/actions/auth/userActions";
import { AppDispatch } from "../../store/store";

function BlockedUser() {
   const dispatch = useDispatch<AppDispatch>();
   const handleLogout = () => {
      dispatch(logoutAction());
   };
   return (
      <>
         <div className="w-screen h-screen bg-red-100 flex flex-col items-center justify-center">
            <h2 className="font-medium text-xl">You are blocked from the site</h2>
            <button onClick={handleLogout}>Sign Out</button>
         </div>
      </>
   );
}

export default BlockedUser;
