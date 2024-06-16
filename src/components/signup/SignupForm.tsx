import { Formik, Form, ErrorMessage, Field } from "formik";
import { signupSchema } from "../../schemas/SignupSchema";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { loginWithGoogle, signupAction } from "../../store/actions/auth/userActions";
import { IUserSignupdata } from "../../interfaces/IUserSignup";
import { AppDispatch } from "../../store/store";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import Header from "../header/Header";

function SignupForm() {
   const initialValues: IUserSignupdata = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
   };

   const dispatch = useDispatch<AppDispatch>();
   const navigate = useNavigate();

   const [showPassword, setShowPassword] = useState<boolean>(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
   const togglePasswordVisibility = (): void => {
      setShowPassword(!showPassword);
   };
   const toggleConfirmPasswordVisibility = (): void => {
      setShowConfirmPassword(!showConfirmPassword);
   };
   const handleSubmit = (values: IUserSignupdata) => {
      const { confirmPassword, ...restValues } = values;

      dispatch(signupAction(restValues)).then((data) => {
         if (data?.payload?.status === "ok") {
            navigate(`/verification?email=${restValues.email}`);
            toast("you have successfully created your account", {
               style: { backgroundColor: "blue", color: "white" },
            });
         } else {
            toast(data?.payload?.message);
         }
      });
   };

   const handleGoogleLoginSuccess = (tokenResponse: any) => {
      const accessToken = tokenResponse.access_token;
      dispatch(loginWithGoogle(accessToken)).then(() => {
         navigate("/");
      });
   };

   const handleGoogleLoginError = (error: any) => {
      toast(error.message);
   };

   const googleAuth = useGoogleLogin({ onSuccess: handleGoogleLoginSuccess, onError: handleGoogleLoginError });
   return (
      <>
         <Header />
         <div className="flex flex-col md:flex-row w-full overflow-hidden">
            <div className="w-full md:w-1/2 ">
               <img src="images/front-image.png" className="mt-12 mx-auto md:mt-24 " alt="" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start">
               <h2 className="text-2xl md:text-3xl  font-bold text-gray-700 -400 mb-4 mt-14 md:ml-8">Sign Up</h2>
               <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={signupSchema}>
                  {() => (
                     <Form className="p-4 md:p-8 w-full max-w-md">
                        <div className="flex flex-col mb-4">
                           <label htmlFor="fullName" className="text-black mb-2">
                              Full Name
                           </label>
                           <Field name="fullName" type="text" className="w-full bg-gray-200 rounded-lg px-4 py-2" />
                           <ErrorMessage className="text-red-700" name="fullName" component="span" />
                        </div>
                        <div className="flex flex-col mb-4">
                           <label htmlFor="email" className="text-black mb-2">
                              Email
                           </label>
                           <Field type="email" name="email" className="w-full bg-gray-200 rounded-lg px-4 py-2" />
                           <ErrorMessage className="text-red-700" name="email" component="span" />
                        </div>
                        <div className="flex flex-col mb-4">
                           <label htmlFor="password" className="text-black mb-2">
                              Password
                           </label>
                           <div className="relative">
                              <Field type={showPassword ? "text" : "password"} name="password" className="w-full bg-gray-200 rounded-lg px-4 py-2" />
                              <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 px-4 py-2">
                                 {!showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                              </button>
                           </div>
                           <ErrorMessage className="text-red-700" name="password" component="span" />
                        </div>
                        <div className="flex flex-col mb-4">
                           <label htmlFor="confirmPassword" className="text-black mb-2">
                              Confirm Password
                           </label>
                           <div className="relative">
                              <Field
                                 type={showConfirmPassword ? "text" : "password"}
                                 name="confirmPassword"
                                 className="w-full bg-gray-200 rounded-lg px-4 py-2"
                              />
                              <button type="button" onClick={toggleConfirmPasswordVisibility} className="absolute inset-y-0 right-0 px-4 py-2">
                                 {!showConfirmPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                              </button>
                           </div>
                           <ErrorMessage className="text-red-700" name="confirmPassword" component="span" />
                        </div>
                        <button type="submit" className="bg-gray-700 text-white py-2 px-4 rounded-lg mb-4 w-full">
                           Sign Up
                        </button>
                     </Form>
                  )}
               </Formik>
               <p className="text-black mb-4 text-center md:text-left md:ml-8">
                  Already have an account?{" "}
                  <Link className="text-blue-800" to={"/"}>
                     Login
                  </Link>
               </p>
               <div className="flex ml-8 items-center w-full">
                  <button onClick={() => googleAuth()} className="bg-white ml-20 sm:ml-0 text-black border border-blue-950 py-2 px-4 rounded-lg mb-4">
                     <FontAwesomeIcon icon={faGoogle} /> Login with Google
                  </button>
               </div>
            </div>
         </div>
      </>
   );
}

export default SignupForm;
