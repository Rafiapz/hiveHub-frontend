import { FC, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { emailSchema } from "../../schemas/SignupSchema";
import { forgotPasswordSendEmail } from "../../service/api";
import toast from "react-hot-toast";
import LoadingButton from "../loading/LoadingButton";

const ForgotPassword: FC = () => {
   const [loading, setLoading] = useState(false);
   const handleSubmit = (values: { email: string }) => {
      setLoading(true);
      const { email } = values;
      forgotPasswordSendEmail(email).then((response: any) => {
         setLoading(false);

         if (response.data.status === "ok") {
            toast.success("A reset password confirmation email has sent to your email id please verify", {
               style: { backgroundColor: "#4caf50", color: "white" },
               duration: 10000,
            });
         } else {
            toast.error(response.data.message, { style: { backgroundColor: "#ff6347", color: "#eeeeee" } });
         }
      });
   };
   return (
      <div className="flex flex-col md:flex-row w-full overflow-hidden">
         <div className="size-1/2 mt-12 mx-auto md:mt-24 md:p-5 ">
            <img src="images/front-image.png" className="ml-5 " alt="" />
         </div>
         <div className="forgot-password-container flex flex-col items-center w-full md:w-1/2 mt-8 md:mt-32 pr-10">
            <h2 className="text-xl md:text-2xl font-medium text-gray-800 text-center mb-4">Don't worry, we've got you covered!</h2>
            <p className="text-gray-600 text-center px-4 md:px-0">
               It happens to the best of us. Enter your email address below, and we'll send you a confirmation email to reset your password.
            </p>
            <Formik initialValues={{ email: "" }} onSubmit={handleSubmit} validationSchema={emailSchema}>
               <Form className="p-4 md:p-8 w-full max-w-md">
                  <div className="flex flex-col space-y-2">
                     <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address:
                     </label>
                     <Field
                        name="email"
                        type="email"
                        className="p-2 w-full border bg-gray-200 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                     />
                     <ErrorMessage name="email" component="span" className="text-red-500 text-sm" />
                  </div>
                  {loading ? (
                     <LoadingButton />
                  ) : (
                     <button type="submit" className="mt-4 w-full md:w-32 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-700">
                        Continue
                     </button>
                  )}
               </Form>
            </Formik>
         </div>
      </div>
   );
};

export default ForgotPassword;
