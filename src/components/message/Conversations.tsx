import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { format } from "timeago.js";
import { fetchOnlineUsers } from "../../service/api";
import toast from "react-hot-toast";

interface ConversationsProps {
  conversations: any[];
  handleSelectConversation: (chat: any) => void;
  setDirect: (direct: boolean) => void;
  curChatId?: string;
  userId?: string;
  onlineUsers?: any[];
  searchQuery?: string;
}

const Conversations: FC<ConversationsProps> = ({
  conversations,
  handleSelectConversation,
  setDirect,
  curChatId,
  userId: propUserId,
  onlineUsers: propOnlineUsers,
  searchQuery = "",
}) => {
  const stateUserId = useSelector(
    (state: RootState) => state?.user?.user?.userId,
  );
  const currentUserId = propUserId || stateUserId;
  const [onlineUsers, setOnlineUsers] = useState<any[]>(propOnlineUsers || []);

  useEffect(() => {
    if (!propOnlineUsers || propOnlineUsers.length === 0) {
      handlefetchOnline();
    } else {
      setOnlineUsers(propOnlineUsers);
    }
  }, [propOnlineUsers]);

  const handlefetchOnline = async () => {
    try {
      const response = await fetchOnlineUsers();
      setOnlineUsers(response?.data?.data || []);
    } catch (error) {
      toast.error("Failed to load online status");
    }
  };

  const filteredConversations = conversations?.filter((c: any) => {
    if (!searchQuery.trim()) return true;
    const partner =
      c?.members[1]?._id !== currentUserId ? c?.members[1] : c?.members[0];
    const partnerName = partner?.fullName?.toLowerCase() || "";
    return partnerName.includes(searchQuery.toLowerCase().trim());
  });

  if (!filteredConversations || filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 h-64">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">
          {searchQuery
            ? "No matching conversations found"
            : "No conversations yet"}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {searchQuery
            ? "Try a different search term"
            : "Click 'New Chat' above to message someone"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-1 p-2 overflow-y-auto">
      {filteredConversations.map((c: any) => {
        const partner =
          c?.members[1]?._id !== currentUserId ? c?.members[1] : c?.members[0];
        const isOnline = onlineUsers?.includes(partner?._id);
        const isSelected = curChatId === c?._id;

        return (
          <div
            key={c?._id}
            onClick={() => {
              handleSelectConversation(c);
              setDirect(true);
            }}
            className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-orange-50/90 border border-orange-200 shadow-sm"
                : "hover:bg-slate-100/80 border border-transparent"
            }`}
          >
            {/* Profile Photo with Online Indicator */}
            <div className="relative flex-shrink-0">
              <img
                src={partner?.profilePhoto || "/placeholder-avatar.png"}
                alt={partner?.fullName || "User"}
                className={`w-12 h-12 rounded-full object-cover ring-2 transition-all ${
                  isSelected
                    ? "ring-orange-500 shadow-sm"
                    : "ring-slate-200 group-hover:ring-slate-300"
                }`}
                onError={(e: any) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.fullName || "User")}&background=F97316&color=fff`;
                }}
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
              )}
            </div>

            {/* Conversation Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <h4
                  className={`text-sm font-semibold truncate ${
                    isSelected
                      ? "text-orange-950 font-bold"
                      : "text-slate-800 group-hover:text-slate-900"
                  }`}
                >
                  {partner?.fullName || "HiveHub User"}
                </h4>
                <span className="text-[11px] text-slate-400 flex-shrink-0">
                  {format(c?.updatedAt || c?.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="truncate">
                  {isOnline ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      Online
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Click to view messages
                    </span>
                  )}
                </span>

                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Conversations;
