import { FC, useEffect, useState } from "react";
import { createPayment, premiumOrder, validateOrder } from "../../../service/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import PremiumSuccessModal from "../../../components/modal/PremiumSuccessModal";
import socketService from "../../../service/socketService";
import Popup from "../../../components/notification/Popup";
import VideoCall from "../../../components/videoCall/VideoCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faCrown,
   faCheck,
   faShieldAlt,
   faBolt,
   faStar,
   faLock,
} from "@fortawesome/free-solid-svg-icons";

const socket = socketService.socket;

const Premium: FC = () => {
   const [isLoading, setIsLoading] = useState(false);
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
   const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
   const userData: any = useSelector((state: RootState) => state.user.user.data);
   const [notified, setNotified] = useState<boolean>(false);
   const [notificationData, setNotificationData] = useState<any>(null);

   useEffect(() => {
      const getNotifiationEvent = (data: any) => {
         if (data?.senderId !== userId) {
            setNotificationData(data);
            setNotified(true);
         }
      };
      socket.on("getNotifiation", getNotifiationEvent);
      return () => {
         socket.off("getNotifiation", getNotifiationEvent);
      };
   }, [socket, userId]);

   const closeModal = () => {
      setModalIsOpen(false);
   };

   const handleOrder = async () => {
      try {
         setIsLoading(true);

         const amount: any = 69900;
         const formData = new FormData();
         formData.append("userId", userId);
         formData.append("amount", amount);
         const response = await premiumOrder(formData);

         const options = {
            key: "rzp_test_n7T0wcONYZwk3H",
            amount: "69900",
            currency: "INR",
            name: "HiveHub",
            description: "HiveHub Premium Subscription",
            image: "/logo.png",
            order_id: response?.data?.order_id,
            handler: async (resp: any) => {
               const form = new FormData();
               form.append("razorpay_payment_id", resp?.razorpay_payment_id);
               form.append("razorpay_order_id", resp?.razorpay_order_id);
               form.append("razorpay_signature", resp?.razorpay_signature);

               validateOrder(form)
                  .then(() => {
                     const paymentForm = new FormData();
                     paymentForm.append("paymentId", resp?.razorpay_payment_id);
                     paymentForm.append("orderId", resp?.razorpay_order_id);
                     paymentForm.append("userId", userId);
                     paymentForm.append("amount", amount);

                     createPayment(paymentForm).then((res) => {
                        if (res?.data?.status === "ok") {
                           toast.success("Payment Successful! Welcome to Premium");
                           setModalIsOpen(true);
                        }
                     });
                  })
                  .catch((err) => {
                     toast.error(err?.message || "Payment validation failed");
                  });
            },
            prefill: {
               name: userData?.fullName || "HiveHub Member",
               email: userData?.email || "user@hivehub.com",
               contact: "9999999999",
            },
            notes: {
               address: "HiveHub HQ",
            },
            theme: {
               color: "#F97316",
            },
         };
         const rzp1 = new (window as any).Razorpay(options);
         setIsLoading(false);
         rzp1.open();
      } catch (error: any) {
         setIsLoading(false);
         toast.error(error?.response?.data?.message || "Failed to initiate payment");
      }
   };

   const perks = [
      {
         icon: faCrown,
         title: "Verified Gold Badge",
         desc: "Stand out with an exclusive badge on your profile and every post",
      },
      {
         icon: faBolt,
         title: "Priority Visibility",
         desc: "Amplify your posts & polls to reach more hive members",
      },
      {
         icon: faShieldAlt,
         title: "Dedicated Support",
         desc: "Priority 24/7 assistance from our support team",
      },
      {
         icon: faStar,
         title: "Exclusive Creator Perks",
         desc: "Early access to upcoming features and community tools",
      },
   ];

   return (
      <div className="sm:ml-64 min-h-screen px-4 sm:px-6 py-10 flex flex-col items-center justify-center" style={{ background: "#F1F5F9" }}>
         <Popup notification={notified} data={notificationData} />

         {userData?.premium ? (
            /* ACTIVE VIP SUBSCRIBER VIEW */
            <div className="max-w-2xl w-full bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/70 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200">
               {/* Ambient Glow */}
               <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

               <div className="relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10">
                     <FontAwesomeIcon icon={faCrown} className="text-3xl" />
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3">
                     VIP Member
                  </span>

                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                     Welcome, {userData?.fullName}!
                  </h2>
                  <p className="text-sm text-slate-300 max-w-md mx-auto mb-8">
                     Your HiveHub Premium subscription is active. You have full access to all verified creator benefits.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                     {perks.map((p, idx) => (
                        <div
                           key={idx}
                           className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3"
                        >
                           <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FontAwesomeIcon icon={p.icon} className="text-xs" />
                           </div>
                           <div>
                              <h4 className="text-sm font-bold text-white">{p.title}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         ) : (
            /* UPGRADE SHOWCASE VIEW */
            <div className="max-w-xl w-full flex flex-col items-center">
               {/* Header intro */}
               <div className="text-center mb-8">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 mb-3">
                     <FontAwesomeIcon icon={faCrown} className="text-orange-500" />
                     HIVEHUB PREMIUM
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                     Elevate Your Presence
                  </h1>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                     Unlock verified status, increased reach, and exclusive creator features.
                  </p>
               </div>

               {/* Pricing card */}
               <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
                  {/* Card top banner */}
                  <div className="p-6 sm:p-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white relative overflow-hidden">
                     <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="flex items-baseline gap-1 mb-1">
                           <span className="text-4xl sm:text-5xl font-black tracking-tight">₹699</span>
                           <span className="text-sm font-semibold opacity-90">/ month</span>
                        </div>
                        <p className="text-xs text-orange-100 font-medium">
                           Full access • Instant badge activation
                        </p>
                     </div>
                  </div>

                  {/* Benefit list */}
                  <div className="p-6 sm:p-8 space-y-4">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Included with Premium:
                     </h3>

                     <div className="space-y-3.5">
                        {perks.map((p, idx) => (
                           <div key={idx} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                 <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-bold text-slate-800">{p.title}</h4>
                                 <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                              </div>
                           </div>
                        ))}
                     </div>

                     {/* Action button */}
                     <div className="pt-6">
                        <button
                           onClick={handleOrder}
                           disabled={isLoading}
                           className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                        >
                           {isLoading ? (
                              <span>Processing payment...</span>
                           ) : (
                              <>
                                 <FontAwesomeIcon icon={faCrown} />
                                 <span>Upgrade Now — ₹699</span>
                              </>
                           )}
                        </button>
                     </div>

                     {/* Trust notes */}
                     <div className="flex items-center justify-center gap-4 pt-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                           <FontAwesomeIcon icon={faLock} className="text-[9px]" />
                           Secure Razorpay
                        </span>
                        <span>•</span>
                        <span>Cancel Anytime</span>
                        <span>•</span>
                        <span>Instant Access</span>
                     </div>
                  </div>
               </div>
            </div>
         )}

         <PremiumSuccessModal modalIsOpen={modalIsOpen} closeModal={closeModal} />
         <VideoCall />
      </div>
   );
};

export default Premium;
