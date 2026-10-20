import { useEffect, useState } from "react";
import {
  deletePoll,
  editPoll,
  fetchAllPolls,
  pollVote,
} from "../../service/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { format } from "timeago.js";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import { pollQuestionSchema } from "../../schemas/PollSchema";
import { useNavigate } from "react-router-dom";
import ConnectButton from "../connectButton/ConnectButton";

const Poll = () => {
  const [polls, setPolls] = useState<any>();
  const userId: any = useSelector(
    (state: RootState) => state?.user?.user?.userId,
  );
  const [editing, setEditing] = useState<boolean>(false);
  const networks: any = useSelector(
    (state: RootState) => state?.networks?.network?.data,
  );

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

  const navigate = useNavigate();

  const isFollowing = (id: any) => {
    return networks?.some((ob: any) => {
      return id == ob?.targetUserId && ob?.sourceUserId === userId;
    });
  };

  const handleClick = (id: number, email: string) => {
    navigate(`/others-profile?userId=${id}&email=${email}`);
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
    <div className="w-full space-y-4">
      {polls?.map((ob: any, i: number) => {
        const totalVotes =
          ob?.options?.reduce(
            (sum: number, option: any) => sum + (option?.votes || 0),
            0,
          ) || 0;
        const hasVoted = ob?.voters?.includes(userId);

        return (
          <div
            key={ob?._id}
            className="w-full bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-6 hover:shadow-md transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-100 flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
                  onClick={() =>
                    handleClick(ob?.userId?._id, ob?.userId?.email)
                  }
                >
                  <img
                    src={
                      ob?.userId?.profilePhoto ||
                      "https://avatar.iran.liara.run/public"
                    }
                    alt="Author"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-bold text-slate-800 text-sm hover:text-orange-600 cursor-pointer transition-colors"
                      onClick={() =>
                        handleClick(ob?.userId?._id, ob?.userId?.email)
                      }
                    >
                      {ob?.userId?.fullName}
                    </span>
                    {ob?.userId?.premium && (
                      <span
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] text-white shadow-xs"
                        style={{
                          background:
                            "linear-gradient(135deg, #F97316, #EC4899)",
                        }}
                        title="Premium Member"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {format(ob?.createdAt || Date.now())}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {ob?.userId?._id !== userId &&
                  (isFollowing(ob?.userId?._id) ? (
                    <button
                      onClick={() =>
                        handleClick(ob?.userId?._id, ob?.userId?.email)
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      View Profile
                    </button>
                  ) : (
                    <ConnectButton id={ob?.userId?._id} content="Follow" />
                  ))}

                {ob.userId?._id === userId && (
                  <div className="flex items-center gap-1">
                    {ob?.isEditing ? (
                      <button
                        className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        onClick={() => {
                          setEditing(false);
                          fetchPolls();
                        }}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        onClick={() => {
                          setEditing(true);
                          handleIsEditing(i);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                      onClick={() => handleDelete(ob?._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
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
                  <Form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="question"
                        className="block text-slate-700 font-semibold text-sm mb-1.5"
                      >
                        Poll Question
                      </label>
                      <Field
                        name="question"
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        value={values?.question}
                        onChange={handleChange}
                      />
                      <ErrorMessage
                        name="question"
                        component="div"
                        className="text-rose-500 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-sm mb-1.5">
                        Options
                      </label>
                      <FieldArray name="options">
                        {({ remove }) => (
                          <div className="space-y-2">
                            {values?.options?.map(
                              (option: any, index: number) => (
                                <div
                                  key={option.id}
                                  className="flex items-center gap-2"
                                >
                                  <Field
                                    name={`options.${index}.option`}
                                    type="text"
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    value={option.option}
                                    onChange={handleChange}
                                  />
                                  <button
                                    type="button"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                                    onClick={() => remove(index)}
                                  >
                                    ✕
                                  </button>
                                  <ErrorMessage
                                    name={`options.${index}.option`}
                                    component="div"
                                    className="text-rose-500 text-xs"
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </FieldArray>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <FieldArray name="options">
                        {({ push }) => (
                          <button
                            type="button"
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                            onClick={() =>
                              push({ id: Date.now(), option: "", votes: 0 })
                            }
                          >
                            + Add Option
                          </button>
                        )}
                      </FieldArray>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-xs hover:opacity-95"
                        style={{
                          background:
                            "linear-gradient(135deg, #F97316, #EA580C)",
                        }}
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-orange-700 bg-orange-50 mb-2">
                    <span>📊</span> Community Poll
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {ob?.question}
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {ob?.options.map((option: any) => {
                    const percentage =
                      totalVotes > 0
                        ? Math.round((option.votes / totalVotes) * 100)
                        : 0;
                    return (
                      <div
                        key={option.id}
                        className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 cursor-pointer group hover:border-orange-300 transition-all duration-200 select-none"
                        onClick={() =>
                          handleVote(ob?._id, option?.option, option?.id)
                        }
                      >
                        {/* Progress fill */}
                        <div
                          className="absolute top-0 left-0 bottom-0 transition-all duration-500 opacity-20 group-hover:opacity-30"
                          style={{
                            width: `${percentage}%`,
                            background:
                              "linear-gradient(90deg, #F97316 0%, #FB923C 100%)",
                          }}
                        />
                        {/* Content row */}
                        <div className="relative z-10 flex items-center justify-between px-4 py-3">
                          <span className="font-semibold text-slate-800 text-sm group-hover:text-slate-950 transition-colors">
                            {option.option}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">
                              {option.votes}{" "}
                              {option.votes === 1 ? "vote" : "votes"}
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
                Total votes:{" "}
                <strong className="text-slate-700 font-semibold">
                  {totalVotes}
                </strong>
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

export default Poll;
