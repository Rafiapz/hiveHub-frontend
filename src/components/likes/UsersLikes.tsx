import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
   deletePostAction,
   fetchAllCommentsOfPost,
   fetchAllposts,
   fetchUsersLikedPosts,
   fetchUsersPost,
   likePostAction,
} from "../../store/actions/post/postActions";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { confirmationModalReducer } from "../../store/slices/user/userSlice";
import { handleCommentModal, handleEditPostModal, setSharePost } from "../../store/slices/posts/postSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faHeart } from "@fortawesome/free-solid-svg-icons";
import { format } from "timeago.js";
import ConfirmationModal from "../modal/ConfirmationModal";

const UsersLikes: FC = () => {
   const dispatch = useDispatch<AppDispatch>();
   const likes: any = useSelector((state: RootState) => state?.posts?.likedPosts?.likes);
   const posts: any = useSelector((state: RootState) => state?.posts?.likedPosts?.data);

   const userId = useSelector((state: RootState) => state?.user?.user?.userId);
   const [curPostId, setCurPostId] = useState<number | null>();
   const [page] = useState<number>(1);
   const [_, setItems] = useState<any>(posts);

   useEffect(() => {
      dispatch(fetchUsersLikedPosts());
   }, []);

   // const navigate = useNavigate();

   useEffect(() => {
      dispatch(fetchAllposts({ page })).then((response) => {
         if (response?.payload?.status !== "ok") {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#ff6347", color: "#eeeeee" },
            });
         }
         setItems(response.payload?.data?.posts);
      });
   }, []);

   const [showOptions, setShowOptions] = useState<{
      status: boolean;
      index: number;
   }>({ status: false, index: 0 });

   const { pathname } = useLocation();

   // const handleOptionsClick = (index: number) => {
   //    setShowOptions((prev) => {
   //       if (index == prev.index) {
   //          return {
   //             index: index,
   //             status: !prev.status,
   //          };
   //       } else {
   //          return {
   //             index: index,
   //             status: true,
   //          };
   //       }
   //    });
   // };

   const handleDeletePostModal = (id: number) => {
      setCurPostId(id);
      dispatch(confirmationModalReducer({ status: true }));
   };

   const handleDelete = (id: number) => {
      dispatch(confirmationModalReducer({ status: false }));

      dispatch(deletePostAction(id)).then((response) => {
         if (response?.payload?.status === "ok") {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#4caf50", color: "white" },
            });
            if (pathname === "/profile") {
               dispatch(fetchUsersPost(userId));
            } else if (pathname === "/profile/likes") {
               dispatch(fetchUsersLikedPosts());
            } else {
               setItems((prev: any) => {
                  const newItems = prev.filter((item: any) => item._id != id);
                  console.log("length", newItems.length);

                  return newItems;
               });
            }
         } else {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#ff6347", color: "#eeeeee" },
            });
         }
      });
      dispatch(fetchAllposts({ page }));
   };

   const handleLikePost = (id: number) => {
      dispatch(likePostAction(id)).then(() => {
         dispatch(fetchUsersLikedPosts());
      });
   };

   const setClass = (itemId: any) => {
      return likes?.some((ob: any) => ob.postId === itemId && ob.userId === userId);
   };

   const handleShowComments = (id: number) => {
      dispatch(fetchAllCommentsOfPost(id)).then((response) => {
         if (response.payload.status === "ok") {
            dispatch(handleCommentModal({ status: true, postId: id }));
         }
      });
   };

   // const viewOthersProfile = (id: number, email: string) => {
   //    navigate(`/others-profile?userId=${id}&email=${email}`);
   // };

   const handleSharePost = (post: any) => {
      dispatch(setSharePost({ data: post }));
      // openSharePostModal();
   };

   if (!posts || posts.length === 0) {
      return (
         <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm max-w-lg mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
               <FontAwesomeIcon icon={faHeart} className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No liked posts yet</h3>
            <p className="text-sm text-slate-500 mt-1">Posts you like will be collected and shown here.</p>
         </div>
      );
   }

   return (
      <div className="flex flex-col items-center overflow-hidden">
         <div className="flex  overflow-hidden">
            <div className="min w-full">
               {posts?.map((item: any, i: number) => {
                  return (
                     <div
                        key={item?._id + i}
                        className="bg-white border border-slate-200/80 w-full max-w-2xl p-6 rounded-2xl shadow-sm mx-auto mt-4 hover:shadow-md transition-all duration-300 relative overflow-hidden "
                        onClick={() => setShowOptions({ index: i, status: false })}
                     >
                        {/* <div className=" flex justify-end">
                           <div
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleOptionsClick(i);
                              }}
                              className="flex gap-1 items-center  justify-center w-14 h-6 rounded-full hover:bg-gray-200 cursor-pointer"
                           >
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                           </div>
                        </div> */}

                        <div className="flex items-center h-10 hover:cursor-pointer">
                           <div className="w-10 h-10 rounded-full overflow-hidden mr-4 ring-2 ring-slate-100 flex-shrink-0 bg-slate-100 flex items-center justify-center relative shadow-xs">
                              {item?.userId?.profilePhoto ? (
                                 <img
                                    src={item?.userId?.profilePhoto}
                                    alt="User"
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
                           <div className="flex items-center">
                              {item?.userId?.premium && (
                                 <svg
                                    className="fill-current mr-2 text-indigo-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    width="16"
                                    height="16"
                                 >
                                    <circle cx="8" cy="8" r="8" fill="" />
                                    <path d="M5.17 8.5L2.14 5.5L3.5 4.17L8.83 9.5L13.17 5.5z" fill="white" />
                                 </svg>
                              )}
                              <div className="flex flex-col">
                                 <p className="font-bold text-gray-800">{item?.userId?.fullName}</p>
                                 <p className="text-sm text-gray-500">{format(item?.createdAt)}</p>
                              </div>
                           </div>
                           {showOptions?.status && showOptions?.index === i && (
                              <div
                                 className={` left-[190px] mt-1 w-28 bg-white border border-gray-400 shadow-lg rounded-md
                                        ${showOptions?.status && showOptions?.index === i ? "block" : "hidden"}
                                        left-[600px] static ml-auto w-auto border-none shadow-none rounded-none
                              `}
                              >
                                 <ul className="py-1 flex md:items-center">
                                    {userId === item?.userId?._id && (
                                       <>
                                          <li
                                             onClick={() =>
                                                dispatch(
                                                   handleEditPostModal({
                                                      status: true,
                                                      content: item?.content,
                                                      media: {
                                                         type: item?.media?.type,
                                                         url: item?.media?.path,
                                                      },
                                                      _id: item?._id,
                                                   })
                                                )
                                             }
                                             className="p-2 hover:bg-gray-100 cursor-pointer md:mr-2"
                                          >
                                             Edit
                                          </li>
                                          <li
                                             onClick={() => handleDeletePostModal(item?._id)}
                                             className="p-2 hover:bg-gray-100 cursor-pointer md:mr-2"
                                          >
                                             Delete
                                          </li>
                                       </>
                                    )}
                                 </ul>
                              </div>
                           )}
                        </div>

                        <p className="p-4 ">{item?.content}</p>

                        {item?.media?.type === "image" && item?.media?.path && (
         <div className="relative w-full bg-slate-950/[0.03] overflow-hidden flex items-center justify-center border-y border-slate-100 max-h-[560px] my-3">
            <div
               className="absolute inset-0 bg-center bg-cover filter blur-2xl opacity-20 scale-110 pointer-events-none"
               style={{ backgroundImage: `url(${item?.media?.path})` }}
            />
            <img
               src={`${item?.media?.path}`}
               alt="Posted"
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
                           <div className="flex gap-4">
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
                              <div onClick={() => handleSharePost(item)}>
                                 <div className="mr-2 text-gray-700 text-l hover:text-green-600 transition duration-300">Shares</div>
                                 <p>{item?.shares}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
            <ConfirmationModal curId={curPostId} handleDelete={handleDelete} />
         </div>
      </div>
   );
};

export default UsersLikes;
