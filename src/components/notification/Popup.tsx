import { useState, useEffect, FC } from "react";
import { useNavigate } from "react-router-dom";

const Popup: FC<any> = ({ data, status }) => {
   const [showPopup, setShowPopup] = useState(false);
   const navigate = useNavigate();

   useEffect(() => {
      if (data) {
         setShowPopup(true);
         const timer = setTimeout(() => {
            setShowPopup(false);
         }, 5000);
         return () => clearTimeout(timer);
      }
   }, [data]);

   if (!data) return null;

   const { actionBy, actionOn, notification } = data;

   const handleNavigate = () => {
      navigate("/notifications");
   };

   return (
      <div
         style={{ left: "550px" }}
         onClick={handleNavigate}
         className={`fixed top-4  w-1/2 rounded-md shadow-lg text-gray-800 border  bg-white transition-all duration-300 ${
            showPopup ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
         } z-50 max-w-lg`}
      >
         <div className="flex flex-col p-4">
            <div className="flex justify-between items-center mb-2">
               <p className="text-lg font-semibold">{notification}</p>
               {status && (
                  <span
                     className={`rounded-full px-2 py-1 text-xs ${
                        status === "success" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-yellow-500"
                     }`}
                  >
                     {status}
                  </span>
               )}
            </div>
            <p className="text-sm text-gray-800">
               <span className="font-semibold">{actionBy}</span> {notification.toLowerCase()}
            </p>
            {actionOn && <p className="text-sm text-gray-400 mt-1">Action on: {actionOn}</p>}
         </div>
      </div>
   );
};

export default Popup;
