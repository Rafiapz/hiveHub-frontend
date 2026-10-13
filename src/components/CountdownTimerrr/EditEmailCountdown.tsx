import React, { FC, useEffect, useRef } from "react";

interface ChildProps {
   timer: number;
   setTimer: React.Dispatch<React.SetStateAction<number>>;
   email: string | null;
   resendOtp: () => void;
}

const EditEmailCountdown: FC<ChildProps> = ({ timer, setTimer, resendOtp }) => {
   const intervalRef = useRef<any>();

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
      setTimer(120);
      resendOtp();
   };
   return (
      <>
         {timer > 0 ? (
            <div className="bg-gray-200 rounded-lg w-14 ml-24">
               <div className="my-2 text-start text-xl font-semibold text-gray-900">{formatTime(timer)}</div>
            </div>
         ) : (
            <span onClick={handleResendOtp} className="text-blue-500 cursor-pointer ">
               Didn't get OTP? Resend
            </span>
         )}
      </>
   );
};

export default EditEmailCountdown;
