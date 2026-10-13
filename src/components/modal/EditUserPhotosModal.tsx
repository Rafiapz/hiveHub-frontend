import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import { handleEditUserPhotosModal } from "../../store/slices/user/userSlice";
import {
  editUserImages,
  fetchuser,
} from "../../store/actions/auth/userActions";
import toast from "react-hot-toast";

function EditUserPhotosModal() {
  const isOpen = useSelector(
    (state: RootState) => state?.user?.editUserPhotosModal?.isOpen,
  );
  const [image, setImage] = useState<File | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const type = useSelector(
    (state: RootState) => state?.user?.editUserPhotosModal?.type,
  );

  if (!isOpen) {
    document.body.style.overflow = "auto";
    return null;
  } else {
    document.body.style.overflow = "hidden";
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImage(file);
      if (
        !["image/jpeg", "image/png", "image/svg+xml", "image/webp"].includes(
          file.type,
        )
      ) {
        setError("Please select a valid image file (JPEG, PNG, WebP)");
        return;
      } else {
        setError("");
      }
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleClose = () => {
    dispatch(handleEditUserPhotosModal({ status: false, type: "" }));
    setImage(null);
    setImageUrl("");
    setError("");
  };

  const handleSubmit = () => {
    if (!image) {
      toast.error("Please choose an image to upload");
      return;
    }

    handleClose();
    const formData = new FormData();
    formData.append("image", image);

    dispatch(editUserImages({ formData, type })).then((response) => {
      toast.success(response?.payload?.message || "Photo updated successfully");
      dispatch(fetchuser());
    });
  };

  const modalTitle =
    type === "coverPhoto" ? "Update Cover Photo" : "Update Profile Photo";
  const modalDescription =
    type === "coverPhoto"
      ? "Upload a wide banner image to personalize your profile header"
      : "Upload a clean photo so hive members can recognize you";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-all"
        onClick={handleClose}
      ></div>

      <div className="bg-white rounded-3xl shadow-2xl z-50 w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">{modalTitle}</h3>
            <p className="text-xs text-slate-500">{modalDescription}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {imageUrl ? (
            <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-64">
              <img
                src={imageUrl}
                alt="Preview"
                className={`w-full ${type === "coverPhoto" ? "h-48 object-cover" : "h-56 object-contain"}`}
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImageUrl("");
                }}
                className="absolute top-3 right-3 w-7 h-7 bg-slate-900/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-md transition-all"
                title="Remove image"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="user-image-upload"
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl bg-slate-50/50 hover:bg-orange-50/30 cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center mb-3 transition-colors shadow-xs">
                <FontAwesomeIcon icon={faCloudUploadAlt} className="text-xl" />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-orange-950">
                Click to select an image
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Supports PNG, JPG, or WebP
              </span>
              <input
                id="user-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!image}
            className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditUserPhotosModal;
