import { FC } from "react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faShare } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { deletePostAction, fetchAllCommentsOfPost, fetchAllposts, fetchUsersPost, likePostAction } from "../../store/actions/post/postActions";
import Loading from "../loading/Loading";
import toast from "react-hot-toast";
import ConfirmationModal from "../modal/ConfirmationModal";
import { confirmationModalReducer } from "../../store/slices/user/userSlice";
import { handleCommentModal, handleEditPostModal, handleReportPostId, setSharePost } from "../../store/slices/posts/postSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "timeago.js";
import InfiniteScroll from "react-infinite-scroll-component";
import EditPostModal from "../modal/EditPostModal";
import PostLikesModal from "../modal/PostLikesModal";
import socketService from "../../service/socketService";
import ConnectButton from "../connectButton/ConnectButton";

const socket = socketService.socket;

const Posts: FC<any> = ({ openModal, openSharePostModal }: any) => {
   const dispatch = useDispatch<AppDispatch>();
   const userId = useSelector((state: RootState) => state.user.user.userId);
   const [curPostId, setCurPostId] = useState<number | null>();
   const [hasMore] = useState<boolean>(true);
   const likes: any = useSelector((state: RootState) => state?.posts?.posts?.likes);
   const posts: any = useSelector((state: RootState) => state.posts.posts.data);
   const [page, setPage] = useState<number>(1);
   const [items, setItems] = useState<any>(posts);
   const [likesModal, setLikesModal] = useState<boolean>(false);
   const [curLikesCount, setCurLikesCount] = useState<number | null>(null);
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const networks: any = useSelector((state: RootState) => state?.networks?.network?.data);

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

   const navigate = useNavigate();

   const isFollowing = (id: any) => {
      return networks?.some((ob: any) => {
         return id == ob?.targetUserId && ob?.sourceUserId === userId;
      });
   };

   const handleClick = (id: number, email: string) => {
      navigate(`/others-profile?userId=${id}&email=${email}`);
   };

   const handleOptionsClick = (index: number) => {
      setShowOptions((prev) => {
         if (index == prev.index) {
            return {
               index: index,
               status: !prev.status,
            };
         } else {
            return {
               index: index,
               status: true,
            };
         }
      });
   };

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
      dispatch(likePostAction(id)).then((response) => {
         if (pathname === "/profile") {
            dispatch(fetchUsersPost(userId));
         } else {
            const post = response?.payload?.post;
            dispatch(fetchAllposts({ page })).then(() => {
               setItems((prev: any) => {
                  const newItems = prev.map((item: any) => {
                     if (item._id === id) {
                        return { ...item, likes: post.likes };
                     }
                     return item;
                  });
                  return newItems;
               });

               if (response?.payload?.message === "Succesfully liked post") {
                  socket.emit("sendNotification", {
                     senderId: userId,
                     receiverId: response?.payload?.post?.userId?._id,
                     notification: "Liked your post",
                     postId: id,
                     actionBy: userData?.fullName,
                  });
               }
            });
         }
      });
   };

   const setClass = (itemId: any) => {
      return likes.some((ob: any) => ob.postId === itemId && ob.userId === userId);
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
      openSharePostModal();
   };

   const fetchMore = () => {
      dispatch(fetchAllposts({ page: page + 1 }))
         .then((response: any) => {
            setPage(page + 1);
            if (response?.payload?.data?.posts?.length >= 1) {
               setItems((prev: any) => [...prev, ...response.payload?.data?.posts]);
            } else {
               setPage(1);
               dispatch(fetchAllposts({ page: 1 })).then((res) => {
                  setItems((prev: any) => [...prev, ...res.payload?.data?.posts]);
               });
            }
         })
         .catch(() => {
            toast.error("error");
         });
   };

   const [previewImage, setPreviewImage] = useState<string | null>(null);

   const closeLikesModal = () => {
      setLikesModal(false);
   };

   return (
      <>
         <div className="w-full">
            <InfiniteScroll
               dataLength={items?.length}
               next={() => fetchMore()}
               hasMore={hasMore}
               className="w-full space-y-4"
               loader={
                  <div
                     className="bg-white w-full border border-slate-200/70 p-6 rounded-2xl sm:rounded-3xl shadow-sm my-4"
                     key={46597}
                  >
                     <Loading />
                  </div>
               }
            >
               {items?.map((item: any, i: number) => {
                  return (
                     <div
                        key={item?._id + i}
                        className="relative bg-white w-full border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                        onClick={() => setShowOptions({ index: i, status: false })}
                     >
                        {/* Post header */}
                        <div className="flex items-center justify-between px-5 pt-4 pb-3">
                           <div className="flex items-center gap-3">
                              <div
                                 className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-100 flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
                                 onClick={() => handleClick(item?.userId?._id, item?.userId?.email)}
                              >
                                 <img
                                    src={item?.userId?.profilePhoto || "https://avatar.iran.liara.run/public"}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                              <div>
                                 <div className="flex items-center gap-1.5">
                                    <p
                                       className="font-bold text-slate-800 text-sm hover:text-orange-600 cursor-pointer transition-colors"
                                       onClick={() => handleClick(item?.userId?._id, item?.userId?.email)}
                                    >
                                       {item?.userId?.fullName}
                                    </p>
                                    {item?.userId?.premium && (
                                       <span
                                          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] text-white shadow-xs"
                                          style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}
                                          title="Premium Member"
                                       >
                                          ✓
                                       </span>
                                    )}
                                 </div>
                                 <p className="text-xs text-slate-400 font-medium">{format(item?.createdAt)}</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              {item?.userId?._id !== userId && (
                                 isFollowing(item?.userId?._id) ? (
                                    <button
                                       onClick={() => handleClick(item?.userId?._id, item?.userId?.email)}
                                       className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                       View Profile
                                    </button>
                                 ) : (
                                    <ConnectButton id={item?.userId?._id} content="Follow" />
                                 )
                              )}
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleOptionsClick(i);
                                 }}
                                 className="w-8 h-8 rounded-full flex items-center justify-center gap-[3px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                                 aria-label="Post options"
                              >
                                 <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                                 <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                                 <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                              </button>
                           </div>
                        </div>

                        {/* Dropdown menu */}
                        {showOptions?.status && showOptions?.index === i && (
                           <div className="absolute right-4 top-14 w-40 bg-white border border-slate-100 shadow-xl rounded-2xl z-30 overflow-hidden py-1 animate-fade-in">
                              <ul className="text-sm font-medium">
                                 {userId === item?.userId?._id && (
                                    <>
                                       <li
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             dispatch(
                                                handleEditPostModal({
                                                   status: true,
                                                   content: item?.content,
                                                   media: { type: item?.media?.type, url: item?.media?.path },
                                                   _id: item?._id,
                                                })
                                             );
                                          }}
                                          className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-slate-700 flex items-center gap-2.5 transition-colors"
                                       >
                                          <span>✏️</span> Edit Post
                                       </li>
                                       <li
                                          onClick={(e) => { e.stopPropagation(); handleDeletePostModal(item?._id); }}
                                          className="px-4 py-2.5 hover:bg-rose-50 cursor-pointer text-rose-600 flex items-center gap-2.5 transition-colors"
                                       >
                                          <span>🗑️</span> Delete
                                       </li>
                                    </>
                                 )}
                                 {userId !== item?.userId?._id && (
                                    <li
                                       className="px-4 py-2.5 hover:bg-amber-50 cursor-pointer text-amber-600 flex items-center gap-2.5 transition-colors"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          dispatch(handleReportPostId({ postId: item?._id }));
                                          openModal();
                                       }}
                                    >
                                       <span>🚩</span> Report Post
                                    </li>
                                 )}
                              </ul>
                           </div>
                        )}

                        {/* Post content */}
                        {item?.content && (
                           <div className="px-5 pb-3">
                              <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                                 {item?.content}
                              </p>
                           </div>
                        )}

                        {/* Media: Perfectly fit image with ambient backdrop and lightbox */}
                        {item?.media?.type === "image" && item?.media?.path && (
                           <div
                              className="relative w-full bg-slate-950/[0.03] overflow-hidden flex items-center justify-center cursor-pointer select-none group border-y border-slate-100 max-h-[580px]"
                              onClick={() => setPreviewImage(item?.media?.path)}
                           >
                              {/* Ambient blur for portrait/letterbox images */}
                              <div
                                 className="absolute inset-0 bg-center bg-cover filter blur-2xl opacity-20 scale-110 pointer-events-none"
                                 style={{ backgroundImage: `url(${item?.media?.path})` }}
                              />
                              <img
                                 src={`${item?.media?.path}`}
                                 alt="Post content"
                                 className="relative z-10 w-full h-auto max-h-[580px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                                 loading="lazy"
                              />
                              <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/75 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 pointer-events-none shadow-sm">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                 </svg>
                                 Expand
                              </div>
                           </div>
                        )}

                        {/* Video player */}
                        {item?.media?.type === "video" && item?.media?.path && (
                           <div className="w-full bg-slate-950 flex items-center justify-center border-y border-slate-100 max-h-[540px]">
                              <video controls src={`${item?.media?.path}`} className="w-full max-h-[540px] object-contain" />
                           </div>
                        )}

                        {/* Actions bar */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                           <div className="flex items-center gap-2">
                              {/* Like */}
                              <button
                                 className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                                    setClass(item?._id)
                                       ? "text-rose-600 bg-rose-50 border border-rose-100 shadow-xs"
                                       : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                 }`}
                                 onClick={() => handleLikePost(item?._id)}
                              >
                                 <FontAwesomeIcon icon={faHeart} className={`text-base ${setClass(item?._id) ? "animate-pulse" : ""}`} />
                                 <span
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       setCurLikesCount(item?.likes);
                                       setCurPostId(item?._id);
                                       setLikesModal(true);
                                    }}
                                    className="cursor-pointer hover:underline"
                                 >
                                    {item?.likes || 0}
                                 </span>
                              </button>

                              {/* Comment */}
                              <button
                                 className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 hover:scale-105"
                                 onClick={() => handleShowComments(item?._id)}
                              >
                                 <FontAwesomeIcon icon={faComment} className="text-base" />
                                 <span>{item?.comments || 0}</span>
                              </button>

                              {/* Share */}
                              <button
                                 className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 hover:scale-105"
                                 onClick={() => handleSharePost(item)}
                              >
                                 <FontAwesomeIcon icon={faShare} className="text-base" />
                                 <span>{item?.shares || 0}</span>
                              </button>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </InfiniteScroll>
            <PostLikesModal closeLikesModal={closeLikesModal} likesModal={likesModal} postId={curPostId} likes={curLikesCount} />
         </div>

         {/* Fullscreen Image Lightbox */}
         {previewImage && (
            <div
               className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
               onClick={() => setPreviewImage(null)}
            >
               <button
                  className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 text-lg cursor-pointer"
                  onClick={() => setPreviewImage(null)}
               >
                  ✕
               </button>
               <img
                  src={previewImage}
                  alt="Full preview"
                  className="max-w-[95vw] max-h-[92vh] object-contain rounded-xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
               />
            </div>
         )}

         <EditPostModal items={items} setItems={setItems} />
         <ConfirmationModal curId={curPostId} handleDelete={handleDelete} />
      </>
   );
};

export default Posts;
