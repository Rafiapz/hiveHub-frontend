import { FC, useEffect, useState } from "react";
import Menu from "../../../components/menu/Menu";
import RightSideBar from "../../../components/rightSideBar/RightSideBar";
import { createPayment, premiumOrder, validateOrder } from "../../../service/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import PremiumSuccessModal from "../../../components/modal/PremiumSuccessModal";
import Header from "../../../components/header/Header";
import socketService from "../../../service/socketService";
import Popup from "../../../components/notification/Popup";

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
   }, [socket]);

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

         var options = {
            key: "rzp_test_n7T0wcONYZwk3H",
            amount: "69900",
            currency: "INR",
            name: "hiveHub",
            description: "Test Transaction",
            image: "https://example.com/your_logo",
            order_id: response?.data?.order_id,
            handler: async (response: any) => {
               console.log(response, "response");

               const form = new FormData();

               form.append("razorpay_payment_id", response?.razorpay_payment_id);
               form.append("razorpay_order_id", response?.razorpay_order_id);
               form.append("razorpay_signature", response?.razorpay_signature);

               validateOrder(form)
                  .then(() => {
                     const form = new FormData();
                     form.append("paymentId", response?.razorpay_payment_id);
                     form.append("orderId", response?.razorpay_order_id);
                     form.append("userId", userId);
                     form.append("amount", amount);

                     createPayment(form).then((res) => {
                        if (res?.data?.status === "ok") {
                           toast.success("Payment Success");

                           setModalIsOpen(true);
                        }
                     });
                  })
                  .catch((err) => {
                     toast.error(err?.message);
                  });
            },
            prefill: {
               name: "Gaurav Kumar",
               email: "gaurav.kumar@example.com",
               contact: "9000090000",
            },
            notes: {
               address: "Razorpay Corporate Office",
            },
            theme: {
               color: "#3399cc",
            },
         };
         var rzp1 = new window.Razorpay(options);
         setIsLoading(false);
         rzp1.open();
      } catch (error: any) {
         setIsLoading(false);
         console.log(error);

         toast.error(error?.response?.data?.message);
      }
   };

   return (
      <>
         <Menu />
         <Header />
         <Popup notification={notified} data={notificationData} />
         {userData?.premium ? (
            <div className="mb-8 ml-96 ">
               <h2 className="text-2xl  font-bold mb-4">Welcome, {userData?.fullName}!</h2>
               <p className="text-gray-700 mb-6">As a premium user, you enjoy a range of exclusive benefits:</p>
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Premium Benefits</h3>
                  <ul className="list-disc pl-4">
                     <li className="mb-2">Premium Badge on your profile</li>
                     {/* <li className="mb-2">Access to exclusive content and features</li> */}
                     {/* <li className="mb-2">Ad-free experience</li> */}
                     <li className="mb-2">Priority support</li>
                     <li className="mb-2">Increased visibility</li>
                  </ul>
               </div>
            </div>
         ) : (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
               <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl">
                  <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">Upgrade to Premium</h2>
                  <p className="text-gray-600 mb-8 text-center">Get access to exclusive features and content by upgrading to our premium plan.</p>

                  <div className="mb-8">
                     <h3 className="text-lg font-semibold mb-4">Premium Benefits</h3>
                     <ul className="list-disc pl-4">
                        <li className="mb-2">Premium Badge on your profile</li>
                        {/* <li className="mb-2">Access to exclusive content and features</li> */}
                        {/* <li className="mb-2">Ad-free experience</li> */}
                        <li className="mb-2">Priority support</li>
                        <li className="mb-2">Increased visibility</li>
                     </ul>
                  </div>

                  <div className="mb-6">
                     <p className="text-gray-600 mb-2 text-center">Price: ₹699/month</p>
                     {/* <p className="text-gray-600 mb-6 text-center">Free trial available for 7 days</p> */}
                  </div>

                  <div className="flex justify-center mb-6">
                     <button
                        className="bg-indigo-500 text-white px-6 py-3 rounded-md hover:bg-indigo-600 transition-colors duration-300 flex items-center"
                        onClick={handleOrder}
                     >
                        {isLoading ? (
                           <>
                              <svg
                                 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24"
                              >
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                 ></path>
                              </svg>
                              Processing...
                           </>
                        ) : (
                           <>
                              <span className="mr-2">Upgrade Now</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                 <path
                                    fillRule="evenodd"
                                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                 />
                              </svg>
                           </>
                        )}
                     </button>
                  </div>

                  {/* <p className="text-gray-600 text-center text-sm">
                     By clicking "Upgrade Now", you agree to our{" "}
                     <a href="#" className="text-indigo-600">
                        Terms and Conditions
                     </a>
                     .
                  </p> */}
               </div>
            </div>
         )}

         <PremiumSuccessModal modalIsOpen={modalIsOpen} closeModal={closeModal} />
         <RightSideBar />
      </>
   );
};

export default Premium;
