import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editUserPassword, editUserProfile, fetchuser, logoutAction } from "../../store/actions/auth/userActions";
import { AppDispatch, RootState } from "../../store/store";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { emailSchema, fullNameSchema, passwordSchema } from "../../schemas/SignupSchema";
import toast from "react-hot-toast";
import OtpInput from "react-otp-input";
import EditEmailCountdown from "../CountdownTimerrr/EditEmailCountdown";
import { verifyEmailUpdateOtp } from "../../service/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import socketService from "../../service/socketService";
import { useNavigate } from "react-router-dom";
const socket = socketService.socket;

function EditUserProfile() {
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const [error, setError] = useState("");
   const [emailEditing, setEmailEditing] = useState<boolean>(false);
   const [otp, setOtp] = useState<string>("");
   const initialTime: string | null = localStorage.getItem("timer");
   const initialTimeValue: number = initialTime ? parseInt(initialTime, 10) : 60 * 2;
   const [timer, setTimer] = useState<number>(initialTimeValue);
   const [emailForm, setEmailForm] = useState<any>({});
   const [change, setChange] = useState<boolean>(true);
   const [otpError, setOtpError] = useState("");

   const dispatch = useDispatch<AppDispatch>();
   const navigate = useNavigate();

   const handleChangeOtp = (otp: string) => {
      setOtp(otp);
   };

   const resendOtp = () => {
      handleEmailSubmit(emailForm);
   };

   useEffect(() => {
      if (timer <= 0) {
         setChange(true);
      }
   }, [timer]);

   useEffect(() => {
      dispatch(fetchuser());
   }, []);

   const handleFullNameSubmit = (values: any) => {
      const { fullName } = values;
      const formData = new FormData();

      formData.append("fullName", fullName);

      dispatch(editUserProfile(formData)).then((response) => {
         dispatch(fetchuser());
         if (response?.payload?.status === "ok") {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#4caf50", color: "white" },
            });
         } else {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#ff6347", color: "#eeeeee" },
            });
         }
      });
   };

   const handleEmailSubmit = (values: any) => {
      const { email } = values;
      const formData = new FormData();

      formData.append("email", email);

      dispatch(editUserProfile(formData)).then((response) => {
         dispatch(fetchuser());
         if (response?.payload?.status === "ok") {
            setChange(false);
            toast(response?.payload?.message, {
               style: { backgroundColor: "#4caf50", color: "white" },
            });
            setEmailEditing(true);
         } else {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#ff6347", color: "#eeeeee" },
            });
         }
      });

      setEmailForm(values);
   };

   const handlePasswordSubmit = (values: any) => {
      const { password, oldPassword } = values;
      const formData = new FormData();

      formData.append("oldPassword", oldPassword);

      formData.append("ogOldPassword", userData.password);

      formData.append("password", password);

      dispatch(editUserPassword(formData)).then((response) => {
         dispatch(fetchuser());
         if (response?.payload?.status === "ok") {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#4caf50", color: "white" },
            });
         } else {
            if (response?.payload?.status === "invalid") {
               setError(response?.payload?.error);
            }
            toast(response?.payload?.error, {
               style: { backgroundColor: "#ff6347", color: "#eeeeee" },
            });
         }
      });
   };

   const handleOtpSubmit = async () => {
      if (timer <= 0) {
         setOtpError("Your OTP has timed out. Please request a new one.");
         return;
      } else if (otp.length < 4) {
         setOtpError("Invalid OTP length. Please enter a 4-digit code.");
         return;
      }
      setOtpError("");
      try {
         const response = await verifyEmailUpdateOtp({ otp, oldEmail: userData?.email, newEmail: emailForm?.email });
         if (response.data.status === "ok") {
            toast.success(response?.data?.message);
            dispatch(fetchuser());
            setTimer(0);
            setEmailEditing(false);
            setOtp("");
         } else {
            toast.error(response?.data?.message);
         }
      } catch (error: any) {
         toast.error(error?.response?.data?.message || "An error occured");
      }
   };

   const handleLogout = () => {
      dispatch(logoutAction()).then((response) => {
         if (response?.payload?.status === "ok") {
            socket.disconnect();
            navigate("/");
         }
      });
   };

   return (
      <div className="flex flex-col md:flex-row justify-center mt-3 gap-0">
         <div className="flex justify-center sm:justify-end  w-full md:w-1/2 md:h-screen">
            <div className="bg-white w-full max-w-md mt-20 p-6">
               <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
               <div className="grid grid-cols-1">
                  <Formik initialValues={{ fullName: userData?.fullName }} validationSchema={fullNameSchema} onSubmit={handleFullNameSubmit}>
                     <Form>
                        <div className="flex flex-col">
                           <label htmlFor="fullName" className="block mb-2">
                              Full Name
                           </label>
                           <Field type="text" id="fullName" name="fullName" className="w-full bg-gray-200 rounded-lg px-4 py-2" />
                           <ErrorMessage className="text-red-700" component="span" name="fullName" />
                           <div className="flex justify-end">
                              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mt-4">
                                 Change
                              </button>
                           </div>
                        </div>
                     </Form>
                  </Formik>
                  <Formik initialValues={{ email: userData?.email }} validationSchema={emailSchema} onSubmit={handleEmailSubmit}>
                     <Form>
                        <div className="flex flex-col">
                           <label htmlFor="email" className="block mb-2">
                              Email
                           </label>
                           <Field type="email" id="email" name="email" className="w-full bg-gray-200 rounded-lg px-4 py-2" />
                           <ErrorMessage className="text-red-700" component="span" name="email" />
                        </div>

                        <div className="flex justify-end">
                           {change && (
                              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mt-4">
                                 Change
                              </button>
                           )}
                        </div>
                     </Form>
                  </Formik>
                  {emailEditing && (
                     <>
                        <h2 className="text-xl font-bold  ml-14 mt-7">Enter OTP</h2>
                        <div className="flex items-center ">
                           <OtpInput
                              value={otp}
                              onChange={handleChangeOtp}
                              numInputs={4}
                              renderSeparator={<span> - </span>}
                              renderInput={(props) => <input {...props} />}
                              inputStyle={{
                                 border: "2px solid black",
                                 borderRadius: "8px",
                                 width: "40px",
                                 height: "40px",
                                 fontSize: "20px",
                                 color: "black",
                                 fontWeight: "400",
                                 caretColor: "#ffffff",
                                 backgroundColor: "transparent",
                                 textTransform: "uppercase",
                              }}
                              shouldAutoFocus
                           />
                           <button onClick={handleOtpSubmit} className="ml-4 px-4  py-3 bg-blue-500 text-white font-semibold rounded-md">
                              Verify
                           </button>
                        </div>
                        <span className="text-red-700">{otpError}</span>
                        <div className="flex items-center mt-4 mr-32">
                           <EditEmailCountdown email={emailForm?.email} timer={timer} setTimer={setTimer} resendOtp={resendOtp} />
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>
         <div className="flex justify-center sm:mt-12 sm:justify-start bg-white w-full md:w-1/2 md:h-screen">
            <div className="bg-white w-full max-w-md mt-20 p-6">
               <Formik
                  initialValues={{ password: "", oldPassword: "", confirmPassword: "" }}
                  validationSchema={passwordSchema}
                  onSubmit={handlePasswordSubmit}
               >
                  <Form>
                     <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col">
                           <label htmlFor="oldPassword" className="block mb-2">
                              Old Password
                           </label>
                           <Field type="password" id="oldPassword" name="oldPassword" className="w-full bg-gray-200 rounded-lg px-4 py-2" />
                           <ErrorMessage className="text-red-700" component="span" name="oldPassword" />
                           <span className="text-red-700">{error}</span>
                        </div>
                        <div className="flex flex-col">
                           <label htmlFor="password" className="block mb-2">
                              New Password
                           </label>
                           <Field type="password" id="password" name="password" className="w-full bg-gray-200 rounded-lg px-4 py-2" />
                           <ErrorMessage className="text-red-700" component="span" name="password" />
                        </div>
                        <div className="flex flex-col">
                           <label htmlFor="confirmPassword" className="block mb-2">
                              Confirm Password
                           </label>
                           <Field type="password" id="confirmPassword" name="confirmPassword" className="w-full bg-gray-200 rounded-lg px-4 py-2" />
                           <ErrorMessage className="text-red-700" component="span" name="confirmPassword" />
                        </div>
                        <div className="flex justify-end">
                           <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mt-4">
                              Save
                           </button>
                        </div>
                     </div>
                  </Form>
               </Formik>
            </div>
         </div>
         <button
            onClick={() => handleLogout()}
            className="bg-red-500 mb-2 w-1/2 ml-40 block sm:hidden hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
         >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Logout
         </button>
      </div>
   );
}

export default EditUserProfile;
