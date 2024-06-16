import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { resendOtpAction } from "../../store/actions/auth/userActions";
import { AppDispatch } from "../../store/store";
import toast from "react-hot-toast";

interface ChildProps {
   timer: number;
   setTimer: React.Dispatch<React.SetStateAction<number>>;
   email: string | null;
}

const CountdownTimer: React.FC<ChildProps> = ({ timer, setTimer, email }) => {
   const intervalRef = useRef<any>();
   const dispatch = useDispatch<AppDispatch>();

   const decreaseTime = () => {
      if (timer > 0) {
         setTimer((prev: number) => prev - 1);
      } else {
         clearInterval(intervalRef.current);
         localStorage.removeItem("timer");
      }
   };

   useEffect(() => {
      localStorage.setItem("timer", timer.toString());
      intervalRef.current = setInterval(decreaseTime, 1000);
      return () => {
         clearInterval(intervalRef.current);
         localStorage.removeItem("timer");
      };
   }, [timer]);

   const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const formattedTime = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
      return formattedTime;
   };

   const handleResendOtp = () => {
      dispatch(resendOtpAction(email)).then((data: any) => {
         if (data.payload.status === "ok") {
            setTimer(120);
            toast(data.payload.message, { style: { backgroundColor: "green", color: "white" } });
         } else {
            toast(data.payload.message, { style: { backgroundColor: "red", color: "white" } });
         }
      });
   };
   return (
      <>
         {timer > 0 ? (
            <div className="bg-gray-200 rounded-lg w-14 ml-24">
               <div className="my-2 text-start text-xl font-semibold text-gray-900">{formatTime(timer)}</div>
            </div>
         ) : (
            <span onClick={handleResendOtp} className="text-blue-500 cursor-pointer mr-32">
               Didn't get OTP? Resend
            </span>
         )}
      </>
   );
};

export default React.memo(CountdownTimer);
