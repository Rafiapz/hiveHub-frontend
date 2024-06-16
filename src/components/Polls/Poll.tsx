import { useEffect, useState } from "react";
import { deletePoll, editPoll, fetchAllPolls, pollVote } from "../../service/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { format } from "timeago.js";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import { pollQuestionSchema } from "../../schemas/PollSchema";

const Poll = () => {
   const [polls, setPolls] = useState<any>();
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
   const [editing, setEditing] = useState<boolean>(false);

   useEffect(() => {
      fetchPolls();
   }, []);

   const fetchPolls = async () => {
      try {
         const response = await fetchAllPolls();

         setPolls(response?.data?.data);
      } catch (error) {
         toast.error("Failed to load");
      }
   };

   const handleVote = async (pollId: any, option: any, optionId: any) => {
      try {
         let flag = "ok";

         polls.forEach((ob: any) => {
            if (ob?._id === pollId && ob?.voters.includes(userId)) {
               flag = "not ok";
               return;
            }
         });

         if (flag !== "ok") {
            toast.error("You have already voted");
            return;
         }

         const form = new FormData();
         form.append("pollId", pollId);
         form.append("option", option);
         form.append("optionId", optionId);
         form.append("userId", userId);
          await pollVote(form);
         toast.success("Success");
         fetchPolls();
      } catch (error) {
         toast.error("Failed to vote");
      }
   };

   const handleDelete = async (id: any) => {
      try {
         const response = await deletePoll(id);

         if (response.data.status === "ok") {
            toast.success("Deleted successfully");
            fetchPolls();
         } else {
            throw new Error("Failed to delete");
         }
      } catch (error) {
         toast.error("Failed to delete");
      }
   };

   const handleIsEditing = (index: number) => {
      const updated = polls.map((ob: any, i: number) => {
         return {
            ...ob,
            isEditing: i === index,
         };
      });

      setPolls(updated);
   };

   const handleEditSubmit = async (values: any, poll: any) => {
      console.log("values", values);

      try {
         const form = new FormData();

         form.append("question", values?.question);
         form.append("options", JSON.stringify(values?.options));
         form.append("_id", poll?._id);
         form.append("voters", JSON.stringify(poll?.voters));

         const response = await editPoll(form);
         if (response?.data?.status === "ok") {
            toast.success("Success");
            fetchPolls();
            setEditing(false);
         }
      } catch (error) {
         console.log(error);
         toast.error("Failed to submit");
      }
   };

   return (
      <div className="flex flex-col items-center overflow-hidden">
         {polls?.map((ob: any, i: number) => (
            <div
               key={ob?._id}
               className="bg-white w-full sm:w-[800px] p-6 sm:p-8 rounded-lg shadow-md mx-auto mt-2  hover:shadow-lg transition-shadow duration-300 "
            >
               <div className="flex items-center mb-4">
                  <img src={ob?.userId?.profilePhoto} className="w-8 h-8 rounded-full mr-2 object-cover" />
                  {ob?.userId?.premium && (
                     <svg className="fill-current mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
                        <circle cx="8" cy="8" r="8" fill="" />
                        <path d="M5.17 8.5L2.14 5.5L3.5 4.17L8.83 9.5L13.17 5.5z" fill="white" />
                     </svg>
                  )}
                  <div className="flex flex-col">
                     <span className="text-gray-700 font-semibold">{ob?.userId?.fullName}</span>
                     <p className="text-sm text-gray-500">{format(ob?.createdAt || Date.now())}</p>
                  </div>
                  {ob.userId?._id === userId ? (
                     <div className="ml-auto">
                        {ob?.isEditing ? (
                           <button
                              className="text-sm text-gray-500 hover:text-gray-700 mr-2"
                              onClick={() => {
                                 setEditing(false);
                                 fetchPolls();
                              }}
                           >
                              Cancel
                           </button>
                        ) : (
                           <button
                              className="text-sm text-gray-500 hover:text-gray-700 mr-2"
                              onClick={() => {
                                 setEditing(true), handleIsEditing(i);
                              }}
                           >
                              Edit
                           </button>
                        )}

                        <button className="text-sm text-gray-500 hover:text-gray-700" onClick={() => handleDelete(ob?._id)}>
                           Delete
                        </button>
                     </div>
                  ) : (
                     // <button className="ml-auto text-sm text-gray-500 hover:text-gray-700" onClick={() => {}}>
                     //    Report
                     // </button>
                     <></>
                  )}
               </div>
               {ob?.isEditing && editing ? (
                  <Formik
                     initialValues={{
                        question: ob.question,
                        options: ob.options.map((option: any) => ({
                           id: option.id,
                           option: option.option,
                           votes: option.votes,
                        })),
                     }}
                     validationSchema={pollQuestionSchema}
                     onSubmit={(values: any) => handleEditSubmit(values, ob)}
                  >
                     {({ values, handleChange, handleSubmit, isSubmitting }) => (
                        <Form onSubmit={handleSubmit}>
                           <div className="mb-4">
                              <label htmlFor="question" className="block text-gray-700 font-semibold mb-2">
                                 Poll Question
                              </label>
                              <Field
                                 name="question"
                                 type="text"
                                 className="w-full bg-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 value={values?.question}
                                 onChange={handleChange}
                              />
                              <ErrorMessage name="question" component="div" className="text-red-500 mt-1" />
                           </div>

                           <div className="mb-4">
                              <label htmlFor="options" className="block text-gray-700 font-semibold mb-2">
                                 Options
                              </label>
                              <FieldArray name="options">
                                 {({ remove }) => (
                                    <div>
                                       {values && values.options && values?.options?.length > 0 ? (
                                          values?.options?.map((option: any, index: number) => (
                                             <>
                                                <div key={option.id} className="flex items-center mb-2 rounded-lg bg-gray-100 p-2 pl-0">
                                                   <div className="w-full relative">
                                                      <div className="absolute inset-0 flex items-center">
                                                         <Field
                                                            name={`options.${index}.option`}
                                                            type="text"
                                                            className="w-full bg-transparent rounded-lg font-semibold px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            value={option.option}
                                                            onChange={handleChange}
                                                         />
                                                      </div>

                                                      <div className="h-8">
                                                         <div
                                                            className="h-full text-bold bg-gray-400"
                                                            style={{
                                                               width: `${
                                                                  (option.votes /
                                                                     ob?.options?.reduce((sum: number, option: any) => sum + option?.votes, 0)) *
                                                                  100
                                                               }%`,
                                                            }}
                                                         ></div>
                                                      </div>
                                                   </div>

                                                   <button
                                                      type="button"
                                                      className="text-red-500 hover:text-red-700 ml-2 focus:outline-none"
                                                      onClick={() => remove(index)}
                                                   >
                                                      <svg
                                                         className="w-5 h-5"
                                                         fill="currentColor"
                                                         viewBox="0 0 20 20"
                                                         xmlns="http://www.w3.org/2000/svg"
                                                      >
                                                         <path
                                                            fillRule="evenodd"
                                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                         />
                                                      </svg>
                                                   </button>
                                                </div>
                                                <ErrorMessage name={`options.${index}.option`} component="div" className="text-red-500 ml-2" />
                                             </>
                                          ))
                                       ) : (
                                          <p>No options added yet.</p>
                                       )}
                                    </div>
                                 )}
                              </FieldArray>
                           </div>

                           <div className="flex justify-end">
                              <FieldArray name="options">
                                 {({ push }) => (
                                    <button
                                       type="button"
                                       className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                                       onClick={() => push({ id: Date.now(), option: "", votes: 0 })}
                                    >
                                       Add Option
                                    </button>
                                 )}
                              </FieldArray>
                              <button
                                 type="submit"
                                 className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                 disabled={isSubmitting}
                              >
                                 {isSubmitting ? "Updating..." : "Update Poll"}
                              </button>
                           </div>
                        </Form>
                     )}
                  </Formik>
               ) : (
                  <>
                     <h2 className="text-2xl font-bold mb-4">{ob?.question}</h2>
                     <ul className="flex flex-col gap-3">
                        {ob?.options.map((option: any) => (
                           <div
                              key={option.id}
                              className="flex items-center mb-2  overflow-hidden"
                              onClick={() => handleVote(ob?._id, option?.option, option?.id)}
                           >
                              <div className="w-full ">
                                 <div className=" inset-0 flex items-center">
                                    <span className="font-semibold text-gray-950 ml-4">{option.option}</span>
                                    <span className="text-gray-950 font-semibold ml-4">
                                       {ob?.options && ob.options.reduce((sum: number, opt: any) => sum + opt.votes, 0) !== 0
                                          ? `${Math.floor((option.votes / ob.options.reduce((sum: number, opt: any) => sum + opt.votes, 0)) * 100)}%`
                                          : "0%"}
                                    </span>
                                 </div>
                                 <div className="h-8 bg-gray-200">
                                    <div
                                       className="h-full bg-gray-400"
                                       style={{
                                          width: `${
                                             (option.votes / ob?.options?.reduce((sum: number, option: any) => sum + option?.votes, 0)) * 100
                                          }%`,
                                       }}
                                    ></div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </ul>
                  </>
               )}

               <p className="text-gray-600 mt-4">
                  Total votes: <span className="font-semibold">{ob?.voters?.length}</span>
               </p>
            </div>
         ))}
      </div>
   );
};

export default Poll;
