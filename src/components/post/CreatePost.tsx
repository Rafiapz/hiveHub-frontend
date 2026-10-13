import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { handleCreatePostModal } from "../../store/slices/posts/postSlice";
import { AppDispatch, RootState } from "../../store/store";
import { createPostAction, fetchAllposts } from "../../store/actions/post/postActions";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import socketService from "../../service/socketService";
import ReactLoading from "react-loading";
const socket = socketService.socket;

function CreatePost() {
   const [image, setImage] = useState<any>(null);
   const [croppedImage, setCroppedImage] = useState<any>(null);
   const [crop, setCrop] = useState({ x: 10, y: 20 });
   const [zoom, onZoomChange] = useState(1);
   const [video] = useState<File | null>(null);
   const [content, setContent] = useState<string>("");
   const dispatch = useDispatch<AppDispatch>();
   // const [imageUrl, setImageUrl] = useState<string>("");
   const [error] = useState<string>("");
   const [thumbnail, setThumbnail] = useState<string | null>("");
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const userId: any = useSelector((state: RootState) => state.user.user.userId);
   const isLoading = useSelector((state: RootState) => state.posts.createPost.isLoading);
   const getCroppedImg = (imageSrc: any, pixelCrop: any) => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
         return new Promise((resolve, reject) => {
            const image_object = new Image();
            image_object.src = imageSrc;

            image_object.onload = () => {
               ctx.drawImage(image_object, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

               canvas.toBlob((blob) => {
                  if (blob) {
                     resolve(blob);
                  } else {
                     reject(new Error("Canvas is empty"));
                  }
               }, "image/jpeg");
            };

            image_object.onerror = (error) => {
               reject(error);
            };
         });
      }
   };

   const onCropComplete = async (croppedArea: any, croppedAreaPixels: any) => {
      console.log(croppedArea, croppedAreaPixels);
      const cropped = await getCroppedImg(image, croppedAreaPixels);
      setCroppedImage(cropped);
   };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      const reader = new FileReader();

      reader.onload = () => {
         setImage(reader.result);
      };

      if (file) {
         reader.readAsDataURL(file);
      }

      // if (file) {
      //    setImage(file);
      //    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
      //       setError("Please select a valid image file (JPEG, PNG, GIF)");
      //       return;
      //    } else {
      //       setError("");
      //    }
      //    if (e?.target?.files?.[0]) {
      //       const url = URL.createObjectURL(e?.target?.files[0]);
      //       setImageUrl(url);
      //       console.log(url);
      //    }
      // }
   };

   // const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   //    const file = e?.target?.files?.[0];

   //    if (file) {
   //       setVideo(file);
   //       if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
   //          setError("Please select a valid video file (video/mp4, video/webm, video/ogg)");
   //          return;
   //       } else {
   //          const reader = new FileReader();

   //          reader.onload = () => {
   //             const thumbnailDataUrl = reader?.result as string;
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

   const handleSubmit = () => {
      const formData = new FormData();

      if (croppedImage) {
         formData.append("image", croppedImage);
      } else if (image) {
         formData.append("image", image);
      }
      if (video) {
         formData.append("video", video);
      }

      formData.append("content", content);

      dispatch(createPostAction(formData)).then((response: any) => {
         if (response.payload.status === "ok") {
            toast(response.payload.message, { style: { backgroundColor: "#4caf50", color: "white" } });
            dispatch(fetchAllposts({}));
            if (userData?.premium) {
               socket.emit("sendNotificationtoAll", {
                  senderId: userId,
                  notification: "Posted a new post",
                  actionBy: userData?.fullName,
               });
            }
         } else {
            toast(response.payload.message, { style: { backgroundColor: "#ff6347", color: "#eeeeee" } });
         }
      });
   };

   return (
      <div className="p-6">
         {/* Modal Header */}
         <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Create Post</h3>
            <button
               onClick={() => dispatch(handleCreatePostModal())}
               className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
               ✕
            </button>
         </div>

         {/* Author preview */}
         <div className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-100">
               <img
                  src={userData?.profilePhoto || "https://avatar.iran.liara.run/public"}
                  alt="Profile"
                  className="w-full h-full object-cover"
               />
            </div>
            <div>
               <p className="font-bold text-slate-800 text-sm">{userData?.fullName || "You"}</p>
               <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                  🌐 Public
               </span>
            </div>
         </div>

         {/* Content input */}
         <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="What do you want to talk about?"
            className="w-full p-3 rounded-2xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 placeholder-slate-400 text-sm leading-relaxed transition-all resize-none"
            rows={4}
         />

         {/* Media preview / cropper */}
         {image && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 relative">
               <div style={{ width: "100%", height: "280px", position: "relative" }}>
                  <Cropper
                     image={image}
                     crop={crop}
                     zoom={zoom}
                     aspect={4 / 3}
                     onCropChange={setCrop}
                     onCropComplete={onCropComplete}
                     onZoomChange={onZoomChange}
                     style={{ containerStyle: { width: "100%", height: "100%" } }}
                  />
               </div>
               <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 text-white text-xs">
                  <span>Zoom / Adjust crop</span>
                  <button
                     onClick={() => {
                        setImage(null);
                        setCroppedImage(null);
                     }}
                     className="text-rose-400 hover:text-rose-300 font-medium"
                  >
                     Remove Image
                  </button>
               </div>
            </div>
         )}

         {thumbnail && (
            <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-200 w-fit">
               <img
                  src="https://raw.githubusercontent.com/github/explore/43b2caff479914f066fd7761bf9c83adf2666c4e/topics/video/video.png"
                  alt="Uploaded"
                  className="max-w-72 max-h-40 p-1"
               />
               <button
                  onClick={() => setThumbnail("")}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center text-xs hover:bg-rose-600 transition-colors"
               >
                  ✕
               </button>
            </div>
         )}

         {error && <p className="text-rose-600 text-xs mt-2">{error}</p>}

         {/* Upload trigger bar */}
         <div className="mt-4 p-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Add media to your post</span>
            <label
               htmlFor="image-upload"
               className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-xs"
            >
               <FontAwesomeIcon icon={faImage} className="text-orange-500" />
               <span>Photo</span>
            </label>
            <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
         </div>

         {/* Footer actions */}
         <div className="flex items-center justify-end gap-2.5 mt-5 pt-4 border-t border-slate-100">
            <button
               onClick={() => dispatch(handleCreatePostModal())}
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
                  <span>Posting...</span>
               </button>
            ) : (
               <button
                  onClick={handleSubmit}
                  disabled={!content.trim() && !image}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-xs hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
               >
                  Publish Post
               </button>
            )}
         </div>
      </div>
   );
}

export default CreatePost;
