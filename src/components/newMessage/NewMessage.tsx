import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { createConversation } from "../../store/actions/message/messageActions";
import { searchUser } from "../../service/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faUserPlus,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

interface NewMessageProps {
  modalIsOpen: boolean;
  closeModal: () => void;
  handleFetchConversations: () => void;
  handleSelectConversation: (conversation: any) => void;
  conversations: any[];
  onlineUsers: any[];
}

const NewMessage: React.FC<NewMessageProps> = ({
  modalIsOpen,
  closeModal,
  handleFetchConversations,
  handleSelectConversation,
  conversations,
  onlineUsers,
}) => {
  const allUsers: any = useSelector(
    (state: RootState) => state?.user?.allUsers?.data,
  );
  const userId = useSelector((state: RootState) => state?.user?.user?.userId);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (allUsers) {
      setSuggestions(allUsers.filter((u: any) => u?._id !== userId));
    }
  }, [allUsers, userId]);

  const dispatch = useDispatch<AppDispatch>();

  const handleClick = (receiverId: any) => {
    closeModal();
    let flag = "ok";
    let conv;

    conversations?.forEach((ob: any) => {
      if (
        ob?.members[0]?._id === receiverId ||
        ob?.members[1]?._id === receiverId
      ) {
        handleSelectConversation(ob);
        flag = "return ";
        conv = ob;
        return;
      }
    });

    if (flag === "return ") {
      handleFetchConversations();
      handleSelectConversation(conv);
      return;
    }

    const form = new FormData();
    form.append("senderId", userId || "");
    form.append("receiverId", receiverId);

    dispatch(createConversation(form)).then((response) => {
      if (response?.payload?.status === "ok") {
        closeModal();
        handleFetchConversations();
        handleSelectConversation(response?.payload?.data);
      }
    });
  };

  const handleCloseModal = () => {
    setSearchQuery("");
    setSuggestions(
      allUsers ? allUsers.filter((u: any) => u?._id !== userId) : [],
    );
    closeModal();
  };

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setSuggestions(
        allUsers ? allUsers.filter((u: any) => u?._id !== userId) : [],
      );
      return;
    }
    try {
      const newSuggestions = await searchUser(query);
      const list = newSuggestions?.data || [];
      setSuggestions(list.filter((u: any) => u?._id !== userId));
    } catch (error) {
      console.error("Error searching user", error);
    }
  };

  return (
    <Modal
      appElement={document.getElementById("root") as HTMLElement}
      overlayClassName="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all"
      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-slate-100 outline-none animate-in fade-in zoom-in-95 duration-200"
      isOpen={modalIsOpen}
      onRequestClose={handleCloseModal}
      contentLabel="Start New Message Modal"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={faUserPlus} className="text-sm" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                New Message
              </h2>
              <p className="text-xs text-slate-500">
                Search for a user to start a conversation
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative flex items-center">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3.5 text-slate-400 text-sm"
            />
            <input
              type="text"
              value={searchQuery}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              onChange={handleInputChange}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions(
                    allUsers
                      ? allUsers.filter((u: any) => u?._id !== userId)
                      : [],
                  );
                }}
                className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-3 max-h-[360px] space-y-1">
          {suggestions && suggestions.length > 0 ? (
            suggestions.map((user: any) => {
              const isOnline = onlineUsers?.includes(user?._id);
              return (
                <div
                  key={user?._id}
                  onClick={() => handleClick(user?._id)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-orange-50/70 border border-transparent hover:border-orange-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={user?.profilePhoto || "/placeholder-avatar.png"}
                        alt={user?.fullName || "User"}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-orange-400 transition-all"
                        onError={(e: any) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=F97316&color=fff`;
                        }}
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-orange-950 truncate">
                        {user?.fullName}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-orange-600 hidden sm:inline">
                      Message
                    </span>
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-sm">
                      <FontAwesomeIcon
                        icon={faCommentDots}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600">
                No users found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching with a different name
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NewMessage;
