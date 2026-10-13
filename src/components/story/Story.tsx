import { FC, useEffect, useState } from "react";
import AddStory from "../addStory/AddStory";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  fetchAllStories,
  fetchOthersStory,
  storySeen,
} from "../../store/actions/post/postActions";
import { setCurrentStory } from "../../store/slices/posts/postSlice";
import "./Story.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Story: FC<any> = ({ setView }: any) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const stories: any = useSelector(
    (state: RootState) => state?.posts?.stories?.data,
  );
  const userId: any = useSelector(
    (state: RootState) => state?.user?.user?.userId,
  );
  const myStories: any = useSelector(
    (state: RootState) => state?.posts?.stories?.myStories,
  );
  const userData: any = useSelector(
    (state: RootState) => state?.user?.user?.data,
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchAllStories(userId));
  }, [userId, dispatch]);

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleCurrentStory = (story: any, index: number, myStoryId?: any) => {
    setView(true);

    if (myStoryId) {
      let myStoryIndex: any = 0;
      stories?.forEach((ob: any, i: number) => {
        if (ob?._id === myStoryId) myStoryIndex = i;
      });
      dispatch(setCurrentStory({ index: myStoryIndex }));
      const form = new FormData();
      form.append("userId", userId);
      form.append("storyId", myStoryId);
      dispatch(storySeen(form)).then(() => dispatch(fetchAllStories(userId)));
    } else {
      dispatch(setCurrentStory({ index }));
      const form = new FormData();
      form.append("userId", userId);
      form.append("storyId", story?._id);
      dispatch(storySeen(form)).then(() => dispatch(fetchAllStories(userId)));
      dispatch(fetchOthersStory(story?.userId?._id));
    }
  };

  const hasNewStory =
    myStories?.[0]?.seenBy?.some((ob: any) => ob === userId) === false &&
    myStories?.length > 0 &&
    myStories?.[0]?.media?.length > 0;

  const hasOwnStory =
    myStories && myStories.length > 0 && myStories[0]?.media?.length > 0;

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 p-3.5 sm:p-4">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        {/* My Story Card */}
        <div className="flex flex-col items-center flex-shrink-0 w-16 cursor-pointer group">
          <div className="relative">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-transform duration-200 group-hover:scale-105 ${
                hasNewStory
                  ? "bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500"
                  : hasOwnStory
                    ? "bg-slate-300"
                    : "p-0"
              }`}
              onClick={() => {
                if (hasOwnStory) {
                  handleCurrentStory(myStories[0], 0, myStories[0]?._id);
                } else {
                  setModalIsOpen(true);
                }
              }}
            >
              <div className="bg-white rounded-full p-0.5 w-full h-full">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      hasOwnStory
                        ? myStories[0]?.media[0]
                        : userData?.profilePhoto || "/placeholder-avatar.png"
                    }
                    alt="Your story"
                    onError={(e: any) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        userData?.fullName || "You",
                      )}&background=F97316&color=fff`;
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Add story badge */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalIsOpen(true);
              }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:scale-110 transition-transform"
              title="Add to story"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 text-center font-semibold truncate w-16">
            Your Story
          </p>
        </div>

        <AddStory modalIsOpen={modalIsOpen} closeModal={closeModal} />

        {/* Others' Stories */}
        {stories?.map((story: any, i: number) => {
          if (story?.userId?._id === userId) return null;
          const isSeen = story?.seenBy?.some((ob: any) => ob === userId);

          return (
            <div
              key={story?._id || i}
              className="flex flex-col items-center flex-shrink-0 w-16 cursor-pointer group"
              onClick={() => handleCurrentStory(story, i)}
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-transform duration-200 group-hover:scale-105 ${
                  isSeen
                    ? "bg-slate-200"
                    : "bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500"
                }`}
              >
                <div className="bg-white rounded-full p-0.5 w-full h-full">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                    <img
                      className="w-full h-full object-cover"
                      src={story?.media?.[0]}
                      alt="Story"
                      onError={(e: any) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          story?.userId?.fullName || "User",
                        )}&background=F97316&color=fff`;
                      }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 text-center font-medium truncate w-16">
                {story?.userId?.fullName?.split(" ")[0] || "User"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Story;
