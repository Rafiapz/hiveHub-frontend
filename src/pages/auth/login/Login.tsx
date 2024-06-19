import { Formik, Form, ErrorMessage, Field } from "formik";
import { loginSchema } from "../../../schemas/LoginSchemas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { IUserLogin } from "../../../interfaces/IUserLogin";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { loginAction, loginWithGoogle } from "../../../store/actions/auth/userActions";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import Header from "../../../components/header/Header";

function Login() {
   const dispatch = useDispatch<AppDispatch>();
   const navigate = useNavigate();

   const initialValues: IUserLogin = { email: "", password: "" };
   const handleSubmit = (data: IUserLogin): void => {
      dispatch(loginAction(data))
         .then((res: any) => {
            if (res.payload.status == "ok") {
               if (res?.payload?.userData?.role === "admin") {
                  navigate("/admin");
               } else {
                  navigate("/");
               }
            } else {
               toast(res.payload.message, { style: { backgroundColor: "red", color: "white" } });
            }
         })
         .catch((err: any) => {
            console.log(err, "message");
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
               <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-700 ml-8 mt-10">Login</h2>
               <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={loginSchema}>
                  <Form className="p-4 md:p-8 w-full max-w-md">
                     <div className="flex flex-col mb-4">
                        <label htmlFor="email" className="text-black mb-2">
                           Email
                        </label>
                        <Field name={"email"} type="email" className="w-full    bg-gray-200 rounded-lg px-4 py-2" />
                        <ErrorMessage name="email" className="text-red-700" component={"span"} />
                     </div>
                     <div className="flex flex-col mb-4">
                        <label htmlFor="password" className="text-black mb-2">
                           Password
                        </label>
                        <Field name={"password"} type="password" className="w-full bg-gray-200 rounded-lg px-4 py-2" />
                        <ErrorMessage name="password" className="text-red-700" component={"span"} />
                     </div>
                     <div className="flex justify-end items-center mb-4">
                        <Link className="text-blue-800" to={"/forgot-password"}>
                           Forgot Password?
                        </Link>
                     </div>
                     <button type="submit" className="bg-gray-700 text-white py-2 px-4 rounded-lg mb-4 w-full">
                        Login
                     </button>
                  </Form>
               </Formik>
               <p className="text-black mb-4 ml-10">
                  Don't have an account?{" "}
                  <Link className="text-blue-800" to={"/signup"}>
                     Signup
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

export default Login;
