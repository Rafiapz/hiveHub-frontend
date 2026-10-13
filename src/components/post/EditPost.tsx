import React, { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { handleEditPostModal } from "../../store/slices/posts/postSlice";
import { editPostAction, fetchUsersLikedPosts, fetchUsersPost } from "../../store/actions/post/postActions";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import ReactLoading from "react-loading";

const EditPost: FC<any> = ({ setItems }) => {
   const [image, setImage] = useState<File | null>(null);
   const [video] = useState<File | null>(null);
   const originalContent = useSelector((state: RootState) => state.posts.editPostModal.data.content);
   const [content, setContent] = useState<string>(originalContent);
   const dispatch = useDispatch<AppDispatch>();
   const originalUrl = useSelector((state: RootState) => state.posts.editPostModal.data.media.url);
   const urlType = useSelector((state: RootState) => state.posts.editPostModal.data.media.type);
   const [imageUrl, setImageUrl] = useState<string>(originalUrl);
   const [error, setError] = useState<string>("");
   const [thumbnail, setThumbnail] = useState<string | null>("");
   const postId = useSelector((state: RootState) => state.posts.editPostModal.data._id);
   const userId: any = useSelector((state: RootState) => state.user.user.userId);
   const isLoading = useSelector((state: RootState) => state.posts.editPost.isLoading);

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
         setImage(file);
         if (!["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
            setError("Please select a valid image file (JPEG, PNG, GIF)");
            return;
         } else {
            setError("");
         }
         if (e?.target?.files?.[0]) {
            const url = URL.createObjectURL(e?.target?.files[0]);
            setImageUrl(url);
         }
      }
   };

   // const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   //    const file = e.target.files?.[0];

   //    if (file) {
   //       setVideo(file);
   //       if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
   //          setError("Please select a valid video file (video/mp4, video/webm, video/ogg)");
   //          return;
   //       } else {
   //          const reader = new FileReader();

   //          reader.onload = () => {
   //             const thumbnailDataUrl = reader.result as string;
   //             setThumbnail(thumbnailDataUrl);
   //          };

   //          reader.readAsDataURL(file);
   //          setError("");
   //       }
   //    }
   // };

   const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
   };

   const { pathname } = useLocation();

   const handleSubmit = () => {
      const formData = new FormData();

      if (image) {
         formData.append("image", image);
      }
      if (video) {
         formData.append("video", video);
      }

      formData.append("content", content);

      dispatch(editPostAction({ formData, postId, type: urlType, originalUrl })).then((response) => {
         if (response.payload.status === "ok") {
            toast(response.payload.message, {
               style: { backgroundColor: "#4caf50", color: "white" },
            });
            if (pathname === "/profile") {
               console.log("called prfo");

               dispatch(fetchUsersPost(userId));
            } else if (pathname === "/profile/likes") {
               dispatch(fetchUsersLikedPosts());
            } else {
               setItems((prev: any) => {
                  const newItems = prev.map((item: any) => {
                     if (item._id === postId) {
                        return response?.payload?.postData;
                     }
                     return item;
                  });
                  return newItems;
               });
            }
         } else {
            toast(response.payload.message, {
               style: { backgroundColor: "#ff6347", color: "#eeeeee" },
            });
         }
      });
   };

   return (
      <div className="p-6">
         {/* Modal Header */}
         <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Edit Post</h3>
            <button
               onClick={() => dispatch(handleEditPostModal({ status: false }))}
               className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
               ✕
            </button>
         </div>

         {/* Content input */}
         <div className="py-4">
            <textarea
               value={content}
               onChange={handleContentChange}
               placeholder="Update your post..."
               className="w-full p-3 rounded-2xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 placeholder-slate-400 text-sm leading-relaxed transition-all resize-none"
               rows={4}
            />
         </div>

         {/* Media Preview */}
         {(imageUrl || thumbnail) && (
            <div className="mb-4">
               {imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/[0.04] max-h-72 flex items-center justify-center">
                     <img src={imageUrl} alt="Uploaded" className="max-h-72 w-full object-contain p-2" />
                     <button
                        onClick={() => setImageUrl("")}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-900/80 text-white flex items-center justify-center text-xs hover:bg-rose-600 transition-colors"
                        title="Remove image"
                     >
                        ✕
                     </button>
                  </div>
               )}
               {thumbnail && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-72">
                     <img
                        src="https://raw.githubusercontent.com/github/explore/43b2caff479914f066fd7761bf9c83adf2666c4e/topics/video/video.png"
                        alt="Uploaded video"
                        className="max-w-72 max-h-40 p-1 object-cover"
                     />
                     <button
                        onClick={() => setThumbnail("")}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center text-xs hover:bg-rose-600 transition-colors"
                     >
                        ✕
                     </button>
                  </div>
               )}
            </div>
         )}

         {error && <p className="text-rose-600 text-xs mb-3">{error}</p>}

         {/* Upload trigger bar */}
         <div className="p-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Change image</span>
            <label
               htmlFor="edit-image-upload"
               className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-xs"
            >
               <FontAwesomeIcon icon={faImage} className="text-orange-500" />
               <span>Choose Photo</span>
            </label>
            <input id="edit-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
         </div>

         {/* Footer actions */}
         <div className="flex items-center justify-end gap-2.5 mt-5 pt-4 border-t border-slate-100">
            <button
               onClick={() => dispatch(handleEditPostModal({ status: false }))}
               className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
               Cancel
            </button>
            {isLoading ? (
               <button
                  disabled
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 opacity-80"
                  style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
               >
                  <ReactLoading type={"spin"} color="#ffffff" height={16} width={16} />
                  <span>Saving...</span>
               </button>
            ) : (
               <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-xs hover:opacity-95"
                  style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
               >
                  Save Changes
               </button>
            )}
         </div>
      </div>
   );
};

export default EditPost;
