import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { handleEditUserPhotosModal } from "../../store/slices/user/userSlice";
import { editUserImages, fetchuser } from "../../store/actions/auth/userActions";
import toast from "react-hot-toast";

function EditUserPhotosModal() {
   const isOpen = useSelector((state: RootState) => state?.user?.editUserPhotosModal?.isOpen);
   const [image, setImage] = useState<File | null>(null);
   const dispatch = useDispatch<AppDispatch>();
   const [imageUrl, setImageUrl] = useState<string>("");
   const [error, setError] = useState<string>("");
   const type = useSelector((state: RootState) => state?.user?.editUserPhotosModal?.type);

   if (!isOpen) {
      document.body.style.overflow = "auto";
      return;
   } else {
      document.body.style.overflow = "hidden";
   }

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
         setImage(file);
         if (!["image/jpeg", "image/png", "image/svg", "image/webp"].includes(file.type)) {
            setError("Please select a valid image file (JPEG, PNG)");
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

   const handleSubmit = () => {
      dispatch(handleEditUserPhotosModal({ status: false, type: "" }));
      setImage(null);
      setImageUrl("");
      const formData = new FormData();

      if (image) {
         formData.append("image", image);
         dispatch(editUserImages({ formData, type })).then((response) => {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#4caf50", color: "white" },
            });
            dispatch(fetchuser());
         });
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="fixed inset-0 bg-gray-900 opacity-50"></div>
         <div className="bg-white p-8 rounded-lg z-50 w-1/2">
            <div className=" bg-gray-200 w-full  mt-2 p-4 shadow-lg mx-auto">
               <div className="flex gap-3">
                  <label htmlFor="user-image-upload" className="cursor-pointer mb-4 flex items-center">
                     <FontAwesomeIcon icon={faImage} className="text-blue-500 mr-2" />
                     Upload Photo
                  </label>
                  <input id="user-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
               </div>

               <div className="flex  border border-gray-300 border-dashed p-4 text-center mb-4">
                  {imageUrl && (
                     <div>
                        <img src={imageUrl} alt="Uploaded" className="max-w-60 max-h-60 p-1" />
                        <i onClick={() => setImageUrl("")} className="fa-regular fa-circle-xmark fa-2x"></i>
                     </div>
                  )}

                  <p className="text-red-700">{error}</p>
               </div>
               <div className="flex justify-end">
                  <button
                     onClick={() => dispatch(handleEditUserPhotosModal({ status: false }))}
                     className="bg-white text-black font-bold py-2 px-4 rounded mr-2"
                  >
                     Cancel
                  </button>
                  <button onClick={handleSubmit} className="bg-orange-400 text-white font-bold py-2 px-4 rounded">
                     Submit
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

export default EditUserPhotosModal;
