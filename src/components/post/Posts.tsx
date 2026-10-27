import { FC, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faShare } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { deletePostAction, fetchAllCommentsOfPost, fetchAllposts, fetchUsersPost, likePostAction } from "../../store/actions/post/postActions";
import toast from "react-hot-toast";
import ConfirmationModal from "../modal/ConfirmationModal";
import { confirmationModalReducer } from "../../store/slices/user/userSlice";
import { handleCommentModal, handleCreatePostModal, handleEditPostModal, handleReportPostId, setSharePost } from "../../store/slices/posts/postSlice";
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
   const [hasMore, setHasMore] = useState<boolean>(true);
   const [loading, setLoading] = useState<boolean>(true);
   const likes: any = useSelector((state: RootState) => state?.posts?.posts?.likes);
   const posts: any = useSelector((state: RootState) => state.posts.posts.data);
   const createPostModalOpen = useSelector((state: RootState) => state.posts.createPostModal.isOpen);
   const [page, setPage] = useState<number>(1);
   const [items, setItems] = useState<any[]>(posts || []);
   const [likesModal, setLikesModal] = useState<boolean>(false);
   const [curLikesCount, setCurLikesCount] = useState<number | null>(null);
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const networks: any = useSelector((state: RootState) => state?.networks?.network?.data);
   const prevModalOpen = useRef(createPostModalOpen);
   // Sync local items from Redux store so comment/share/repost counts update dynamically
   const prevPostsRef = useRef<any[]>([]);

   const loadInitialPosts = () => {
      setLoading(true);
      setPage(1);
      dispatch(fetchAllposts({ page: 1 }))
         .then((response: any) => {
            setLoading(false);
            if (response?.payload?.status === "error" || response?.payload?.status === "failed") {
               toast.error(response?.payload?.message || "Failed to load posts");
            }
            const fetchedPosts = response?.payload?.data?.posts;
            if (Array.isArray(fetchedPosts) && fetchedPosts.length > 0) {
               setItems(fetchedPosts);
               setHasMore(true);
            } else {
               setItems([]);
               setHasMore(false);
            }
         })
         .catch((err) => {
            console.error("Failed to load posts:", err);
            setLoading(false);
            setItems([]);
            setHasMore(false);
         });
   };

   useEffect(() => {
      loadInitialPosts();
   }, []);

   // Sync items from Redux whenever posts data changes (e.g. after a comment or share triggers fetchAllposts)
   useEffect(() => {
      if (Array.isArray(posts) && posts.length > 0) {
         // Merge: preserve local order from infinite scroll, but update counts on each item
         setItems((prev: any[]) => {
            if (!prev || prev.length === 0) return posts;
            const postMap = new Map(posts.map((p: any) => [p._id, p]));
            const merged = prev.map((item: any) => {
               const updated = postMap.get(item._id);
               return updated ? updated : item;
            });
            // Append any brand-new posts that aren't in prev yet
            posts.forEach((p: any) => {
               if (!prev.find((item: any) => item._id === p._id)) {
                  merged.unshift(p);
               }
            });
            return merged;
         });
         prevPostsRef.current = posts;
      }
   }, [posts]);

   // When Create Post modal closes, re-fetch to display the newly created post
   useEffect(() => {
      if (prevModalOpen.current && !createPostModalOpen) {
         loadInitialPosts();
      }
      prevModalOpen.current = createPostModalOpen;
   }, [createPostModalOpen]);

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
                  const newItems = (prev || []).filter((item: any) => item._id != id);
                  if (newItems.length === 0) {
                     setHasMore(false);
                  }
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
            if (post) {
               setItems((prev: any) => {
                  return (prev || []).map((item: any) => {
                     if (item._id === id) {
                        return { ...item, likes: post.likes };
                     }
                     return item;
                  });
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
            }
            dispatch(fetchAllposts({ page }));
         }
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

   const handleSharePost = (post: any) => {
      dispatch(setSharePost({ data: post }));
      openSharePostModal();
   };

   const fetchMore = () => {
      const nextPage = page + 1;
      dispatch(fetchAllposts({ page: nextPage }))
         .then((response: any) => {
            const newPosts = response?.payload?.data?.posts;
            if (Array.isArray(newPosts) && newPosts.length >= 1) {
               setPage(nextPage);
               setItems((prev: any) => [...(prev || []), ...newPosts]);
               setHasMore(true);
            } else {
               setPage(1);
               dispatch(fetchAllposts({ page: 1 })).then((res: any) => {
                  const loopPosts = res?.payload?.data?.posts;
                  if (Array.isArray(loopPosts) && loopPosts.length >= 1) {
                     setItems((prev: any) => [...(prev || []), ...loopPosts]);
                     setHasMore(true);
                  } else {
                     setHasMore(false);
                  }
               }).catch(() => {
                  setHasMore(false);
               });
            }
         })
         .catch((err: any) => {
            console.error("Error loading more posts:", err);
            toast.error("Error loading more posts");
         });
   };

   const [previewImage, setPreviewImage] = useState<string | null>(null);

   const closeLikesModal = () => {
      setLikesModal(false);
   };

   return (
      <>
         <div className="w-full">
            {loading && (!items || items.length === 0) ? (
               /* Skeleton Feed while loading */
               <div className="w-full space-y-4">
                  {[1, 2].map((n) => (
                     <div
                        key={n}
                        className="bg-white w-full border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 shadow-sm space-y-4 animate-pulse"
                     >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                              <div className="space-y-1.5">
                                 <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
                                 <div className="w-20 h-2.5 bg-slate-100 rounded-md" />
                              </div>
                           </div>
                           <div className="w-16 h-7 bg-slate-100 rounded-lg" />
                        </div>
                        <div className="space-y-2 pt-1">
                           <div className="w-full h-3 bg-slate-200 rounded-md" />
                           <div className="w-4/5 h-3 bg-slate-150 rounded-md" />
                        </div>
                        <div className="w-full h-44 bg-slate-100 rounded-xl" />
                     </div>
                  ))}
               </div>
            ) : !items || items.length === 0 ? (
               /* Empty State: No posts in feed */
               <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-sm relative overflow-hidden transition-all duration-300">
                  {/* Decorative ambient background glows */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-orange-400/10 to-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-amber-400/10 to-orange-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center">
                     {/* Modern icon badge */}
                     <div
                        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/20 transform transition-transform duration-300 hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #F97316 0%, #FB923C 50%, #EC4899 100%)" }}
                     >
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                           />
                        </svg>
                     </div>

                     {/* Heading & description */}
                     <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                        No Posts in Your Feed Yet
                     </h3>
                     <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                        Your feed is quiet right now. Be the first to share an update, showcase a project, or spark a conversation with the community!
                     </p>

                     {/* Action buttons */}
                     <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                        <button
                           onClick={() => dispatch(handleCreatePostModal())}
                           className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-2xl text-white font-semibold text-sm shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                           style={{ background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)" }}
                        >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                           </svg>
                           <span>Create a Post</span>
                        </button>

                        <button
                           onClick={loadInitialPosts}
                           className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                           <span>Refresh Feed</span>
                        </button>
                     </div>

                     {/* Feature tips pills */}
                     <div className="flex flex-wrap justify-center items-center gap-2 mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 font-medium">
                        <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100">✨ Share photos & videos</span>
                        <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100">👥 Connect with creators</span>
                        <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100">💬 Like & comment</span>
                     </div>
                  </div>
               </div>
            ) : (
               <InfiniteScroll
                  dataLength={items?.length}
                  next={() => fetchMore()}
                  hasMore={hasMore}
                  className="w-full space-y-4"
                  loader={
                     <div className="flex items-center justify-center py-5">
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-500">
                           <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                           <span>Loading more posts...</span>
                        </div>
                     </div>
                  }
                  endMessage={
                     items.length > 3 ? (
                        <div className="text-center py-6">
                           <p className="text-xs font-medium text-slate-400">You've reached the end of the feed ✨</p>
                        </div>
                     ) : null
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
                        <div className="flex items-center justify-between px-5 py-3.5">
                           <div className="flex items-center gap-3">
                              <div
                                 className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-100 flex-shrink-0 cursor-pointer transition-transform hover:scale-105 bg-slate-100 flex items-center justify-center relative shadow-xs"
                                 onClick={() => handleClick(item?.userId?._id, item?.userId?.email)}
                              >
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
                                    <svg
                                       className="w-5 h-5 text-slate-400"
                                       viewBox="0 0 24 24"
                                       fill="currentColor"
                                    >
                                       <circle cx="12" cy="8" r="4" />
                                       <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7H5z" />
                                    </svg>
                                 </div>
                              </div>
                              <div>
                                 <div className="flex items-center gap-1.5 leading-tight">
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
            )}
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
