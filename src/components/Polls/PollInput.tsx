import { FC, useState } from "react";
import { createPoll } from "../../service/api";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faPoll, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

interface PollInputProps {
   onPollCreated?: () => void;
}

const PollInput: FC<PollInputProps> = ({ onPollCreated }) => {
   const [question, setQuestion] = useState("");
   const [options, setOptions] = useState<string[]>(["", ""]);
   const [loading, setLoading] = useState(false);
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
   const navigate = useNavigate();

   const handleAddOption = () => {
      if (options.length >= 6) {
         toast.error("Maximum 6 options allowed");
         return;
      }
      setOptions([...options, ""]);
   };

   const handleRemoveOption = (indexToRemove: number) => {
      if (options.length <= 2) {
         toast.error("At least 2 options are required");
         return;
      }
      setOptions(options.filter((_, idx) => idx !== indexToRemove));
   };

   const handleOptionChange = (index: number, value: string) => {
      const updated = [...options];
      updated[index] = value;
      setOptions(updated);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!question.trim()) {
         toast.error("Please enter a poll question");
         return;
      }

      const validOptions = options.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
         toast.error("Please provide at least 2 non-empty options");
         return;
      }

      try {
         setLoading(true);
         const form = new FormData();
         form.append("userId", userId);
         form.append("question", question.trim());
         form.append("options", JSON.stringify(validOptions));

         const response = await createPoll(form);
         toast.success(response?.data?.message || "Poll created successfully!");
         setQuestion("");
         setOptions(["", ""]);

         if (onPollCreated) {
            onPollCreated();
         } else {
            navigate("/polls");
         }
      } catch (error) {
         toast.error("Failed to create poll");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
               <FontAwesomeIcon icon={faPoll} className="text-base" />
            </div>
            <div>
               <h2 className="text-lg font-bold text-slate-900">Create a Poll</h2>
               <p className="text-xs text-slate-500">Ask the Hive community for their opinions and insights</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Input */}
            <div>
               <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Poll Question <span className="text-orange-500">*</span>
               </label>
               <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Which programming language do you prefer in 2026?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
               />
            </div>

            {/* Poll Options */}
            <div className="space-y-3">
               <label className="block text-xs font-semibold text-slate-700">
                  Options <span className="text-orange-500">*</span>
               </label>

               <div className="space-y-2.5">
                  {options.map((option, idx) => (
                     <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 text-center text-xs font-bold text-slate-400">
                           {idx + 1}.
                        </span>
                        <input
                           type="text"
                           value={option}
                           onChange={(e) => handleOptionChange(idx, e.target.value)}
                           placeholder={`Option ${idx + 1}`}
                           className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                        {options.length > 2 && (
                           <button
                              type="button"
                              onClick={() => handleRemoveOption(idx)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove option"
                           >
                              <FontAwesomeIcon icon={faTrash} className="text-xs" />
                           </button>
                        )}
                     </div>
                  ))}
               </div>

               {options.length < 6 && (
                  <button
                     type="button"
                     onClick={handleAddOption}
                     className="mt-2 text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                     <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                     <span>Add another option</span>
                  </button>
               )}
            </div>

            {/* Live Card Preview */}
            {question && (
               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                     Live Preview
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{question}</h4>
                  <div className="space-y-2">
                     {options
                        .filter((o) => o.trim())
                        .map((opt, i) => (
                           <div
                              key={i}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between"
                           >
                              <span>{opt}</span>
                              <span className="text-[10px] text-slate-400">0 votes</span>
                           </div>
                        ))}
                  </div>
               </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
               <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center gap-2 transition-all"
               >
                  <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                  <span>{loading ? "Publishing..." : "Publish Poll"}</span>
               </button>
            </div>
         </form>
      </div>
   );
};

export default PollInput;
