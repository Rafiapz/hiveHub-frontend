import { useEffect, useState } from "react";
import { deletePoll, editPoll, fetchUsersPolls, pollVote } from "../../service/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { format } from "timeago.js";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import { pollQuestionSchema } from "../../schemas/PollSchema";
import { useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";

const UsersPoll = () => {
   const [polls, setPolls] = useState<any>();
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
   const [editing, setEditing] = useState<boolean>(false);

   const [searchQuery] = useSearchParams();
   const pollUserId = searchQuery.get("userId");

   useEffect(() => {
      fetchPolls();
   }, [pollUserId]);

   const fetchPolls = async () => {
      try {
         const response = await fetchUsersPolls(pollUserId);
         setPolls(response?.data?.data);
      } catch (error) {
         toast.error("Failed to load polls");
      }
   };

   const handleVote = async (pollId: any, option: any, optionId: any) => {
      try {
         let flag = "ok";

         polls?.forEach((ob: any) => {
            if (ob?._id === pollId && ob?.voters?.includes(userId)) {
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
         toast.success("Vote recorded");
         fetchPolls();
      } catch (error) {
         toast.error("Failed to vote");
      }
   };

   const handleDelete = async (id: any) => {
      try {
         const response = await deletePoll(id);
         if (response.data.status === "ok") {
            toast.success("Poll deleted successfully");
            fetchPolls();
         } else {
            throw new Error("Failed to delete");
         }
      } catch (error) {
         toast.error("Failed to delete poll");
      }
   };

   const handleIsEditing = (index: number) => {
      const updated = polls?.map((ob: any, i: number) => {
         return {
            ...ob,
            isEditing: i === index,
         };
      });
      setPolls(updated);
   };

   const handleEditSubmit = async (values: any, poll: any) => {
      try {
         const form = new FormData();
         form.append("pollId", poll?._id);
         form.append("question", values?.question);
         form.append("options", JSON.stringify(values?.options));
         const response = await editPoll(form);
         if (response?.data?.status === "ok") {
            toast.success("Poll updated successfully");
            setEditing(false);
            fetchPolls();
         }
      } catch (error) {
         toast.error("Failed to update poll");
      }
   };

   if (!polls || polls.length === 0) {
      return (
         <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm max-w-lg mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
               <FontAwesomeIcon icon={faChartBar} className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No polls yet</h3>
            <p className="text-sm text-slate-500 mt-1">Community polls created by this user will appear here.</p>
         </div>
      );
   }

   return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
         {polls?.map((ob: any, i: number) => {
            const totalVotes = ob?.options?.reduce((sum: number, opt: any) => sum + opt.votes, 0) || 0;
            const hasVoted = ob?.voters?.includes(userId);

            return (
               <div
                  key={ob?._id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-200"
               >
                  {/* Author Header */}
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <img
                           src={ob?.userId?.profilePhoto || "/placeholder-avatar.png"}
                           className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                           alt={ob?.userId?.fullName}
                           onError={(e: any) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                 ob?.userId?.fullName || "User"
                              )}&background=F97316&color=fff`;
                           }}
                        />
                        <div>
                           <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-900">{ob?.userId?.fullName}</span>
                              {ob?.userId?.premium && (
                                 <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold">
                                    ★
                                 </span>
                              )}
                           </div>
                           <p className="text-[11px] text-slate-400">{format(ob?.createdAt || Date.now())}</p>
                        </div>
                     </div>

                     {ob.userId?._id === userId && (
                        <div className="flex items-center gap-2">
                           {ob?.isEditing ? (
                              <button
                                 className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                                 onClick={() => {
                                    setEditing(false);
                                    fetchPolls();
                                 }}
                              >
                                 Cancel
                              </button>
                           ) : (
                              <button
                                 className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                                 onClick={() => {
                                    setEditing(true);
                                    handleIsEditing(i);
                                 }}
                              >
                                 Edit
                              </button>
                           )}
                           <button
                              className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                              onClick={() => handleDelete(ob?._id)}
                           >
                              Delete
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Poll Body */}
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
                           <Form onSubmit={handleSubmit} className="space-y-4">
                              <div>
                                 <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Poll Question
                                 </label>
                                 <Field
                                    name="question"
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    value={values?.question}
                                    onChange={handleChange}
                                 />
                                 <ErrorMessage name="question" component="div" className="text-red-500 text-xs mt-1" />
                              </div>

                              <div>
                                 <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Options
                                 </label>
                                 <FieldArray name="options">
                                    {({ remove }) => (
                                       <div className="space-y-2">
                                          {values?.options?.map((option: any, index: number) => (
                                             <div key={option.id} className="flex items-center gap-2">
                                                <Field
                                                   name={`options.${index}.option`}
                                                   type="text"
                                                   className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800"
                                                   value={option.option}
                                                   onChange={handleChange}
                                                />
                                                <button
                                                   type="button"
                                                   className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                                                   onClick={() => remove(index)}
                                                >
                                                   ✕
                                                </button>
                                             </div>
                                          ))}
                                       </div>
                                    )}
                                 </FieldArray>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-2">
                                 <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-xs"
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
                        <div className="mb-4">
                           <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                              {ob?.question}
                           </h2>
                        </div>

                        <div className="space-y-2.5">
                           {ob?.options.map((option: any) => {
                              const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                              return (
                                 <div
                                    key={option.id}
                                    className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 cursor-pointer group hover:border-orange-300 transition-all duration-200 select-none"
                                    onClick={() => handleVote(ob?._id, option?.option, option?.id)}
                                 >
                                    {/* Progress fill */}
                                    <div
                                       className="absolute top-0 left-0 bottom-0 transition-all duration-500 opacity-20 group-hover:opacity-30"
                                       style={{
                                          width: `${percentage}%`,
                                          background: "linear-gradient(90deg, #F97316 0%, #FB923C 100%)",
                                       }}
                                    />
                                    {/* Content row */}
                                    <div className="relative z-10 flex items-center justify-between px-4 py-3">
                                       <span className="font-semibold text-slate-800 text-sm group-hover:text-slate-950 transition-colors">
                                          {option.option}
                                       </span>
                                       <div className="flex items-center gap-2">
                                          <span className="text-xs text-slate-400 font-medium">
                                             {option.votes} {option.votes === 1 ? "vote" : "votes"}
                                          </span>
                                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/80 shadow-xs text-slate-700 border border-slate-200/60">
                                             {percentage}%
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                     <span>
                        Total votes: <strong className="text-slate-700 font-semibold">{totalVotes}</strong>
                     </span>
                     {hasVoted && (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                           ✓ You voted
                        </span>
                     )}
                  </div>
               </div>
            );
         })}
      </div>
   );
};

export default UsersPoll;
