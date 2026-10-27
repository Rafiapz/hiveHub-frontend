import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { FC, useEffect, useState } from "react";
import { fetchAllCommentsOfPost, fetchallCommentLikes } from "../../store/actions/post/postActions";
import { likeComment } from "../../service/api";
import toast from "react-hot-toast";

const HeartIcon: FC<any> = ({ commentId }: any) => {
   const userId: any = useSelector((state: RootState) => state.user.user.userId);
   const postId: any = useSelector((state: RootState) => state.posts.comments.postId);
   const [likes, setLikes] = useState<any>([]);

   const dispatch = useDispatch<AppDispatch>();

   useEffect(() => {
      dispatch(fetchallCommentLikes({ postId, commentId })).then((response: any) => {
         setLikes(response?.payload?.data);
      });
   }, []);

   const handleLikeComment = async (commentId: any) => {
      const formData = new FormData();

      formData.append("commentId", commentId);
      formData.append("userId", userId);
      formData.append("postId", postId);

      likeComment(formData)
         .then((_: any) => {
            dispatch(fetchAllCommentsOfPost(postId));
            dispatch(fetchallCommentLikes({ postId, commentId })).then((response: any) => {
               setLikes(response?.payload?.data);
            });
         })
         .catch((err: any) => {
            toast.error(err?.response?.data?.message);
         });
   };

   return (
      <FontAwesomeIcon
         key={commentId}
         onClick={() => {
            handleLikeComment(commentId);
         }}
         icon={faHeart}
         className={`w-4 h-4 cursor-pointer hover:text-red-600 transition-colors duration-200 flex-shrink-0 ${
            likes?.some((ob: any) => ob?.userId === userId) ? "text-red-500" : "text-slate-400"
         }`}
      />
   );
};

export default HeartIcon;
