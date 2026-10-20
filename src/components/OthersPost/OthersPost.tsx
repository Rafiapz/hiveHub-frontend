import { FC, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faComment, faHeart, faShare } from "@fortawesome/free-solid-svg-icons";
import { fetchAllCommentsOfPost, fetchUsersPost, likePostAction } from "../../store/actions/post/postActions";
import { handleCommentModal } from "../../store/slices/posts/postSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useSearchParams } from "react-router-dom";

const OthersPost: FC<any> = ({}) => {
   const dispatch = useDispatch<AppDispatch>();
   const likes: any = useSelector((state: RootState) => state?.posts?.ownPost?.likes);
   const posts: any = useSelector((state: RootState) => state.posts?.ownPost?.data);
   const userId: any = useSelector((state: RootState) => state.user.user.userId);
   const [__, setBlocked] = useState<any>({ status: false });

   const [_, setShowOptions] = useState<{
      status: boolean;
      index: number;
   }>({ status: false, index: 0 });

   const [searchQuery] = useSearchParams();

   const target = searchQuery.get("userId");
   useEffect(() => {
      dispatch(fetchUsersPost({ target, id: userId })).then((response) => {
         if (response?.payload?.data === "blockedByMe") {
            setBlocked({ status: true, byMe: true });
         } else if (response?.payload?.data === "blockedByHim") {
            setBlocked({ status: true, byHim: true });
         } else {
            setBlocked({ status: false });
         }
      });
   }, [target]);

   const handleLikePost = (id: number) => {
      dispatch(likePostAction(id)).then(() => {
         dispatch(fetchUsersPost({ target, id: userId }));
      });
   };

   const setClass = (itemId: any) => {
      return likes.some((ob: any) => ob.postId === itemId && ob.userId === userId);
   };

   const handleShowComments = (id: number) => {
      dispatch(fetchAllCommentsOfPost(id)).then((response: any) => {
         if (response?.payload?.status === "ok") {
            dispatch(handleCommentModal({ status: true, postId: id }));
         }
      });
   };

   return (
      <div className="flex flex-col items-center overflow-hidden">
         {posts?.map((item: any, i: number) => {
            return (
               <div
                  key={item?._id}
                  className="bg-white w-full max-w-2xl border border-slate-200/80 rounded-2xl shadow-sm mx-auto mt-4 p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                  onClick={() => setShowOptions({ index: i, status: false })}
               >
                  <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-3 hover:cursor-pointer">
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-100 flex-shrink-0 bg-slate-100 flex items-center justify-center relative shadow-xs">
                           {item?.userId?.profilePhoto ? (
                              <img
                                 src={item?.userId?.profilePhoto}
                                 alt={item?.userId?.fullName || "User"}
                                 className="w-full h-full object-cover"
                                 onError={(e: any) => {
                                    e.currentTarget.style.display = "none";
                                    const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback");
                                    if (fallback) {
                                       fallback.classList.remove("hidden");
                                       fallback.classList.add("flex");
                                    }
                                 }}
                              />
                           ) : null}
                           <div
                              className={`avatar-fallback ${item?.userId?.profilePhoto ? "hidden" : "flex"} w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 items-center justify-center text-slate-400 select-none`}
                              title={item?.userId?.fullName || "No profile photo"}
                           >
                              <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                                 <circle cx="12" cy="8" r="4" />
                                 <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7H5z" />
                              </svg>
                           </div>
                        </div>
                        <div>
                           <p className="font-bold text-slate-900 text-sm">{item?.userId.fullName}</p>
                           <p className="text-xs text-slate-400 font-medium">
                              {new Date(item?.createdAt).toLocaleString("en-GB", {
                                 day: "2-digit",
                                 month: "2-digit",
                                 year: "numeric",
                              })}
                           </p>
                        </div>
                     </div>
                  </div>

                  {item?.content && (
                     <p className="text-slate-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{item?.content}</p>
                  )}

                  {item?.media?.type === "image" && item?.media?.path && (
                     <div className="relative w-full bg-slate-950/[0.03] overflow-hidden flex items-center justify-center border-y border-slate-100 max-h-[560px] my-3">
                        <div
                           className="absolute inset-0 bg-center bg-cover filter blur-2xl opacity-20 scale-110 pointer-events-none"
                           style={{ backgroundImage: `url(${item?.media?.path})` }}
                        />
                        <img
                           src={`${item?.media?.path}`}
                           alt="Post attachment"
                           className="relative z-10 w-full max-h-[560px] object-contain"
                           loading="lazy"
                        />
                     </div>
                  )}
                  {item?.media?.type === "video" && item?.media?.path && (
                     <div className="w-full bg-slate-950 flex items-center justify-center border-y border-slate-100 max-h-[540px] my-3">
                        <video controls src={`${item?.media?.path}`} className="w-full max-h-[540px] object-contain" />
                     </div>
                  )}

                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-5">
                        <div>
                           <FontAwesomeIcon
                              key={item?.id}
                              onClick={() => {
                                 handleLikePost(item?._id);
                              }}
                              icon={faHeart}
                              className={`${
                                 setClass(item?._id) ? "text-red-600" : "text-gray-400"
                              } mr-2 text-xl hover:text-red-600 transition duration-300`}
                           />
                           <p>{item?.likes}</p>
                        </div>
                        <div>
                           <FontAwesomeIcon
                              icon={faComment}
                              className="mr-2 text-blue-500 text-xl hover:text-blue-600 transition duration-300"
                              onClick={() => {
                                 handleShowComments(item?._id);
                              }}
                           />
                           <p>{item?.comments}</p>
                        </div>
                        <div>
                           <FontAwesomeIcon icon={faShare} className="mr-2 text-yellow-300 text-xl hover:text-green-600 transition duration-300" />
                           <p>{0}</p>
                        </div>
                     </div>

                     <div>
                        <FontAwesomeIcon icon={faBookmark} className="text-gray-500 size-7 cursor-pointer" />
                     </div>

                     {/* Three dots menu */}
                     {/* <div className="relative">
                        <div
                           onClick={(e) => {
                              e.stopPropagation(), handleOptionsClick(i);
                           }}
                           className="flex flex-col gap-1 hover:bg-gray-200 w-4 h-10 justify-center items-center cursor-pointer"
                        >
                           <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                     </div> */}
                  </div>

                  {/* Options menu */}
                  {/* {showOptions?.status == true && showOptions?.index === i && (
                     <div className="absolute top-1 right-4 w-28 h-22 bg-blue-300 mt-2 mr-4 border border-gray-300 shadow-lg rounded-md">
                        <ul>
                           <li
                              className="p-1 hover:bg-blue-500"
                              onClick={() => {
                                 dispatch(handleReportPostId({ postId: item?._id }));
                                 openModal();
                              }}
                           >
                              <button>Report</button>
                           </li>
                        </ul>
                     </div>
                  )} */}
               </div>
            );
         })}
      </div>
   );
};

export default OthersPost;

{
   /* {blocked?.status && blocked?.byMe && (
                  <div className="bg-gray-100 p-4 rounded-md shadow-md">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Blocked User</h3>
                        {blocked?.byHim === false && (
                           <button
                              // onClick={() => handleUnblockUser()}
                              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                           >
                              Unblock
                           </button>
                        )}
                     </div>
                     {blocked?.byHim === false ? (
                        <p className="text-gray-600">You have blocked this user, so you can't send them messages or view their content.</p>
                     ) : (
                        <p> This user has blocked you. You won't be able to send them messages </p>
                     )}
                  </div>
               )} */
}
