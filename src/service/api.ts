import { jsonConfig, multiPartConfig } from "../utils/apiUtils";
import apiClient from "../utils/axios";
import {
    BLOCK_OTHER_USER_URl,
    CREATE_POLL_URL,
    DELETE_NOTIFICATION_URL,
    DELETE_POLL_URL,
    DELETE_REPLY_COMMENT_URL,
    EDIT_POLL_URL,
    FETCH_ALL_POLLS_URL,
    FETCH_CONVERSATIONS_URL,
    FETCH_IS_USER_BLOCKED_URL,
    FETCH_NOTIFICATIONS_URL,
    FETCH_ONLINE_USERS_URL,
    FETCH_PEER_ID,
    FETCH_POST_LIKED_USERS_URL,
    FETCH_USERS_POLLS_URL,
    LIKE_COMMENT_URL,
    POLL_VOTE_URL,
    PREMIUM_CREATE_PAYMENT_URL,
    PREMIUM_ORDER_URL,
    PREMIUM_ORDER_VALIDATE_URL,
    REJECT_REPORT_URL,
    REPLY_COMMENT_URL,
    REPOST_POST_URL,
    RESOLVE_REPORT_URL,
    SEARCH_USER_URL,
    SEND_EMAIL_FOR_RESET_PASSWORD_URL,
    SEND_VIDEO_URL,
    UNBLOCK_OTHER_USER_URl,
    UPLOAD_STORY_URL,
    VERIFY_EMAIL_UPDATE_OTP_URL,
} from "../utils/endPoint";

export const forgotPasswordSendEmail = async (email: string) => {
    try {
        return await apiClient.get(`${SEND_EMAIL_FOR_RESET_PASSWORD_URL}/${email}`);
    } catch (error) { }
};

export const searchUser = async (query: string) => {
    try {
        const response = await apiClient.get(`${SEARCH_USER_URL}?search=${query}`);

        return response.data;
    } catch (error) { }
};

export const fetchConversations = async (userId: string) => {
    try {
        return await apiClient.get(`${FETCH_CONVERSATIONS_URL}/${userId}`);
    } catch (error: any) {
        console.log(error);
    }
};

export const uploadStory = async (form: any) => {
    return await apiClient.post(UPLOAD_STORY_URL + '/image', form, multiPartConfig);
};

export const verifyEmailUpdateOtp = async (data: any) => {
    return await apiClient.put(VERIFY_EMAIL_UPDATE_OTP_URL, data, jsonConfig)
}

export const replyComment = async (form: any) => {
    return await apiClient.post(REPLY_COMMENT_URL, form, jsonConfig)
}

export const deleteReplyComment = async (id: any) => {
    return await apiClient.delete(DELETE_REPLY_COMMENT_URL + '/' + id)
}

export const likeComment = async (form: any) => {
    return await apiClient.post(LIKE_COMMENT_URL, form, jsonConfig)
}

export const sendVideo = async (data: any) => {
    return apiClient.post(SEND_VIDEO_URL + '/video', data, jsonConfig)
}

export const resolveReport = async ({ reportId, postId }: any) => {
    return await apiClient.delete(`${RESOLVE_REPORT_URL}/${reportId}?postId=${postId}`)
}

export const rejectReport = async (reportId: any) => {
    return await apiClient.put(`${REJECT_REPORT_URL}/${reportId}`)
}

export const repostPost = async (form: any) => {
    return await apiClient.post(REPOST_POST_URL, form, jsonConfig)
}

export const fetchNotifications = async (id: any, page: number) => {
    return await apiClient.get(`${FETCH_NOTIFICATIONS_URL}/${id}?page=${page}`)
}

export const deleteNotification = async (id: any) => {
    return await apiClient.delete(`${DELETE_NOTIFICATION_URL}?id=${id}`)
}

export const premiumOrder = async (form: any) => {
    return await apiClient.post(PREMIUM_ORDER_URL, form, jsonConfig)
}

export const validateOrder = async (form: any) => {
    return await apiClient.post(PREMIUM_ORDER_VALIDATE_URL, form, jsonConfig)
}

export const createPayment = async (form: any) => {
    return await apiClient.post(PREMIUM_CREATE_PAYMENT_URL, form, jsonConfig)
}

export const fetchPostLikedUsers = async (postId: any,) => {
    return await apiClient.get(`${FETCH_POST_LIKED_USERS_URL}?postId=${postId}`)
}

export const blockOtherUser = async (form: any) => {
    return await apiClient.put(BLOCK_OTHER_USER_URl, form, jsonConfig)
}

export const unblockOtherUser = async (form: any) => {
    return await apiClient.put(UNBLOCK_OTHER_USER_URl, form, jsonConfig)
}

export const isUserBlocked = async (id: any, target: any) => {
    return await apiClient.get(`${FETCH_IS_USER_BLOCKED_URL}/${id}?target=${target}`)
}

export const createPoll = async (form: any) => {
    return await apiClient.post(CREATE_POLL_URL, form, jsonConfig)
}

export const fetchAllPolls = async () => {
    return await apiClient.get(FETCH_ALL_POLLS_URL)
}

export const pollVote = async (form: any) => {
    return await apiClient.put(POLL_VOTE_URL, form, jsonConfig)
}

export const deletePoll = async (id: any) => {
    return await apiClient.delete(`${DELETE_POLL_URL}?pollId=${id}`)
}

export const editPoll = async (form: any) => {
    return await apiClient.put(EDIT_POLL_URL, form, jsonConfig)
}

export const fetchOnlineUsers = async () => {
    return await apiClient.get(FETCH_ONLINE_USERS_URL)
}

export const fetchUsersPolls = async (id: any) => {

    console.log(`${FETCH_USERS_POLLS_URL}/${id}`);

    return await apiClient.get(`${FETCH_USERS_POLLS_URL}/${id}`)
}

export const fetchPeerId = async (id: any) => {
    return await apiClient.get(FETCH_PEER_ID + '/' + id)
}