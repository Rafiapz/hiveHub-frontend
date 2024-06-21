import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { handleCreatePostModal } from "../../store/slices/posts/postSlice";
import { AppDispatch, RootState } from "../../store/store";
import { createPostAction, fetchAllposts } from "../../store/actions/post/postActions";
import toast from "react-hot-toast";
import socketService from "../../service/socketService";
const socket = socketService.socket;

function CreatePost() {
   const [image, setImage] = useState<File | null>(null);
   const [video] = useState<File | null>(null);
   const [content, setContent] = useState<string>("");
   const dispatch = useDispatch<AppDispatch>();
   const [imageUrl, setImageUrl] = useState<string>("");
   const [error, setError] = useState<string>("");
   const [thumbnail, setThumbnail] = useState<string | null>("");
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const userId: any = useSelector((state: RootState) => state.user.user.userId);

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
            console.log(url);
         }
      }
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

      if (image) {
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
      <div className="bg-gray-200 w-full mt-2 p-4 shadow-lg mx-auto">
         <div className="md:flex gap-3">
            <label htmlFor="image-upload" className="cursor-pointer mb-4 md:mb-0 flex items-center">
               <FontAwesomeIcon icon={faImage} className="text-blue-500 mr-2" />
               Upload Photo
            </label>
            <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {/* <label htmlFor="video-upload" className="cursor-pointer mb-4 flex items-center" >
          <FontAwesomeIcon icon={faVideo} className="text-blue-500 mr-2" />
          Upload Video
        </label>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          className="hidden"
        /> */}
         </div>
         <div className="flex flex-wrap border border-gray-300 border-dashed p-4 text-center mb-4">
            {imageUrl && (
               <div className="mr-4 mb-4 relative">
                  <img src={imageUrl} alt="Uploaded" className="w-96 sm:max-w-80 object-contain sm:h-60 p-1" />
                  <i
                     onClick={() => setImageUrl("")}
                     className="fa-regular fa-circle-xmark fa-2x absolute top-0 right-0 text-red-500 cursor-pointer"
                  ></i>
               </div>
            )}
            {thumbnail && (
               <div className="mr-4 mb-4 relative">
                  <img
                     src="https://raw.githubusercontent.com/github/explore/43b2caff479914f066fd7761bf9c83adf2666c4e/topics/video/video.png"
                     alt="Uploaded"
                     className="max-w-80 max-h-40 p-1"
                  />
                  <i
                     onClick={() => setThumbnail("")}
                     className="fa-regular fa-circle-xmark fa-2x absolute top-0 right-0 text-red-500 cursor-pointer"
                  ></i>
               </div>
            )}
            <p className="text-red-700">{error}</p>
         </div>
         <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Write something..."
            className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 mb-4"
            rows={4}
         ></textarea>
         <div className="flex justify-end md:items-center md:flex-row flex-col">
            <button onClick={() => dispatch(handleCreatePostModal())} className="bg-white text-black font-bold py-2 px-4 rounded mr-2 mb-2 md:mb-0">
               Cancel
            </button>
            <button onClick={handleSubmit} className="bg-orange-400 text-white font-bold py-2 px-4 rounded">
               Submit
            </button>
         </div>
      </div>
   );
}

export default CreatePost;
