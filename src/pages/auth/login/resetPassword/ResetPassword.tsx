import { ErrorMessage, Field, Form, Formik } from "formik";
import { resetPasswordSchema } from "../../../../schemas/SignupSchema";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../store/store";
import { changePassword } from "../../../../store/actions/auth/userActions";
import toast from "react-hot-toast";

function ResetPassword() {
   const [searchQuery] = useSearchParams();

   const dispatch = useDispatch<AppDispatch>();

   const navigate = useNavigate();

   const handleSubmit = (values: { password: string; confirmPassword: string }) => {
      const token = searchQuery.get("token");
      const { password } = values;

      const formData = new FormData();

      if (token) {
         formData.append("token", token);
      }
      if (password) {
         formData.append("password", password);
      }

      dispatch(changePassword(formData)).then((response) => {
         if (response.payload.status === "ok") {
            toast.success(response?.payload?.message);
            navigate("/");
         } else {
            toast.error(response?.payload?.message);
         }
      });
   };
   return (
      <div className="flex flex-col md:flex-row w-full overflow-auto">
         <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <img src="images/front-image.png" className="mt-12 mx-auto md:mt-24" alt="" />
         </div>
         <div className="flex flex-col  w-full  md:w-1/2 mt-8 md:mt-16 px-4 lg:items-start items-center ">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 ">Reset Password</h2>
            <Formik initialValues={{ password: "", confirmPassword: "" }} onSubmit={handleSubmit} validationSchema={resetPasswordSchema}>
               <Form className="w-full max-w-md">
                  <div className="grid grid-cols-1 gap-6">
                     <div className="flex flex-col">
                        <label htmlFor="password" className="text-gray-700 mb-2">
                           New Password
                        </label>
                        <Field
                           type="password"
                           id="password"
                           name="password"
                           className="w-full bg-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Enter your new password"
                        />
                        <ErrorMessage className="text-red-700 mt-1" component="span" name="password" />
                     </div>
                     <div className="flex flex-col">
                        <label htmlFor="confirmPassword" className="text-gray-700 mb-2">
                           Confirm Password
                        </label>
                        <Field
                           type="password"
                           id="confirmPassword"
                           name="confirmPassword"
                           className="w-full bg-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Confirm your new password"
                        />
                        <ErrorMessage className="text-red-700 mt-1" component="span" name="confirmPassword" />
                     </div>
                     <div className="flex justify-center md:justify-end">
                        <button
                           type="submit"
                           className="mt-4 px-6 py-3 rounded-md w-full bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-300"
                        >
                           Change Password
                        </button>
                     </div>
                  </div>
               </Form>
            </Formik>
         </div>
      </div>
   );
}

export default ResetPassword;
