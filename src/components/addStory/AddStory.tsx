import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faTimes, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FC, useState } from "react";
import Modal from "react-modal";
import { uploadStory } from "../../service/api";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchAllStories } from "../../store/actions/post/postActions";

interface AddStoryProps {
   modalIsOpen: boolean;
   closeModal: () => void;
}

const AddStory: FC<AddStoryProps> = ({ modalIsOpen, closeModal }) => {
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
   const [imageUrl, setImageUrl] = useState<string>("");
   const [image, setImage] = useState<File | null>(null);
   const [loading, setLoading] = useState(false);

   const dispatch = useDispatch<AppDispatch>();

   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
         setImage(file);
         if (
            ![
               "image/jpeg",
               "image/png",
               "image/webp",
               "image/gif",
               "video/mp4",
               "video/webm",
               "video/ogg",
            ].includes(file.type)
         ) {
            toast.error("Please select a valid image or video file");
            return;
         }
         const url = URL.createObjectURL(file);
         setImageUrl(url);
      }
   };

   const handleCancel = () => {
      setImage(null);
      setImageUrl("");
      closeModal();
   };

   const handleSubmit = async () => {
      if (!image) {
         toast.error("Please select a photo or video for your story");
         return;
      }

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("image", image);

      try {
         setLoading(true);
         const response = await uploadStory(formData);
         toast.success(response?.data?.message || "Story shared successfully!");
         handleCancel();
         dispatch(fetchAllStories(userId));
      } catch (error: any) {
         toast.error(error?.message || "Failed to upload story");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         overlayClassName="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 outline-none"
         className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 outline-none animate-in fade-in zoom-in-95 duration-200"
         isOpen={modalIsOpen}
         onRequestClose={handleCancel}
         contentLabel="Add Story"
      >
         <div className="flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                  <h3 className="text-base font-bold text-slate-900">Add to Story</h3>
                  <p className="text-xs text-slate-500">Share a moment with your hive for 24 hours</p>
               </div>
               <button
                  onClick={handleCancel}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all"
               >
                  <FontAwesomeIcon icon={faTimes} />
               </button>
            </div>

            {/* Upload & Preview Area */}
            <div className="p-6">
               {imageUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-80">
                     <img
                        src={imageUrl}
                        alt="Story preview"
                        className="w-full h-72 object-cover"
                     />
                     <button
                        type="button"
                        onClick={() => {
                           setImage(null);
                           setImageUrl("");
                        }}
                        className="absolute top-3 right-3 w-7 h-7 bg-slate-900/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-md transition-all"
                        title="Remove media"
                     >
                        <FontAwesomeIcon icon={faTimes} />
                     </button>
                  </div>
               ) : (
                  <label
                     htmlFor="story-file-upload"
                     className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl bg-slate-50/50 hover:bg-orange-50/30 cursor-pointer transition-all group text-center"
                  >
                     <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-500 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center mb-3 transition-colors shadow-xs">
                        <FontAwesomeIcon icon={faCloudUploadAlt} className="text-2xl" />
                     </div>
                     <span className="text-sm font-bold text-slate-800 group-hover:text-orange-950">
                        Choose photo or video
                     </span>
                     <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP or MP4</span>
                     <input
                        id="story-file-upload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleImageChange}
                        className="hidden"
                     />
                  </label>
               )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
               <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
               >
                  Cancel
               </button>
               <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !image}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center gap-2 transition-all"
               >
                  <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                  <span>{loading ? "Sharing..." : "Share to Story"}</span>
               </button>
            </div>
         </div>
      </Modal>
   );
};

export default AddStory;
