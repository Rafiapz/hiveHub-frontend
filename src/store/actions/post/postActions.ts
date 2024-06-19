import { createAsyncThunk } from "@reduxjs/toolkit"
import { CREATE_POST_URL, DELETE_COMMENT_URL, DELETE_POST_URL, DELETE_STORY_URL, EDIT_COMMENT_URL, EDIT_POST_URL, FETCH_ALL_COMMENTS_URL, FETCH_ALL_POSTS_URL, FETCH_ALL_REPLIES_URL, FETCH_ALL_STORIES, FETCH_COMMENT_LIKES, FETCH_COMPLETE_POSTS, FETCH_MY_LIKES_URL, FETCH_OTHERS_STORY_URL, FETCH_USERS_POSTS_URL, LIKE_POST_URL, POST_COMMENT_URL, REPORT_POST_URL, STORY_SEEN_URL } from "../../../utils/endPoint"
import { jsonConfig, multiPartConfig } from "../../../utils/apiUtils"
import apiClient from "../../../utils/axios"


export const createPostAction = createAsyncThunk('/post/create', async (form: any) => {

    try {

        let params
        if (form.has('image'))
            params = 'image'
        else if (form.has('video'))
            params = 'video'

        const response = await apiClient.post(`${CREATE_POST_URL}/${params}`, form, multiPartConfig)


        return response.data
    } catch (error: any) {
        console.log(error);


    }
})


export const editPostAction = createAsyncThunk('/post/edit', async ({ formData, originalUrl, postId, type }: any) => {

    try {

        let params
        if (formData.has('image'))
            params = 'image'
        else if (formData.has('video'))
            params = 'video'

        if (!params) {
            const media = { url: originalUrl, type: type };
            console.log(media);

            formData.append("media", JSON.stringify(media));
        }


        const response = await apiClient.put(`${EDIT_POST_URL}/${params}?postId=${postId}`, formData, multiPartConfig)

        return response.data


    } catch (error: any) {
        console.log(error);


    }
})

export const fetchAllposts = createAsyncThunk('/post/fetch-all-posts', async ({ id, page, size }: any) => {

    try {

        const response = await apiClient.get(`${FETCH_ALL_POSTS_URL}?user=${id}&page=${page}&size=$${size}`)

        return response.data

    } catch (error: any) {

        console.log(error);

    }
})

export const fetchCompletePosts = createAsyncThunk('/posts/fetch-complete-posts', async () => {

    try {

        const response = await apiClient.get(`${FETCH_COMPLETE_POSTS}`)

        return response.data

    } catch (error) {

    }

})


export const deletePostAction = createAsyncThunk('/posts/delete-post', async (id: number) => {
    try {

        const response = await apiClient.delete(`${DELETE_POST_URL}?id=${id}`)

        return response.data

    } catch (error: any) {
        console.log(error);


    }
})

export const likePostAction = createAsyncThunk('/likes/like-post', async (id: number) => {

    try {

        const response = await apiClient.post(`${LIKE_POST_URL}/${id}`)

        return response.data

    } catch (error: any) {
        console.log(error.message);
    }
})


export const fetchAllCommentsOfPost = createAsyncThunk('/comments/fetch-all-comments', async (id: any) => {

    try {

        const response = await apiClient.get(`${FETCH_ALL_COMMENTS_URL}/${id}`)

        return response.data

    } catch (error: any) {
        console.log(error);

    }
})

export const postComment = createAsyncThunk('/comments/post-comment', async ({ formData, postId }: any) => {

    try {


        const response = await apiClient.post(`${POST_COMMENT_URL}/${postId}`, formData, jsonConfig)


        return response.data


    } catch (error: any) {
        console.log(error.message);

    }
})

export const deleteComment = createAsyncThunk('/comments/delete-comment', async (commentId: number) => {

    try {

        const response = await apiClient.delete(`${DELETE_COMMENT_URL}/${commentId}`)

        return response.data


    } catch (error: any) {
        throw new Error(error)

    }
})

export const editComment = createAsyncThunk('/comments/delete-comment', async ({ formData, commentId }: any) => {
    try {


        const response = await apiClient.put(`${EDIT_COMMENT_URL}/${commentId}`, formData, jsonConfig)
        console.log(response.data);

        return response.data


    } catch (error: any) {
        throw new Error(error)
    }
})

export const fetchallCommentLikes = createAsyncThunk('/comments/fetch-likes-of-comment', async ({ postId, commentId }: any) => {
    try {

        const response = await apiClient.get(`${FETCH_COMMENT_LIKES}/${postId}?commentId=${commentId}`)

        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})

export const fetchAllReplies = createAsyncThunk('/comments/fetch-all-replies', async (id: any) => {

    try {

        const response = await apiClient.get(`${FETCH_ALL_REPLIES_URL}/${id}`)

        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})

export const fetchUsersPost = createAsyncThunk('/post/fetch-users-post', async ({ id, target }: any) => {

    try {

        const response = await apiClient.get(`${FETCH_USERS_POSTS_URL}/${id}?target=${target}`)

        return response.data


    } catch (error: any) {
        throw new Error(error.message)
    }
})

export const reportPost = createAsyncThunk('/reports/report-post', async (form: any) => {
    try {

        const response = await apiClient.post(`${REPORT_POST_URL}`, form, jsonConfig)
        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})

export const fetchUsersLikedPosts = createAsyncThunk('/likes/fetch-my-likes', async () => {

    try {

        const response = await apiClient.get(FETCH_MY_LIKES_URL)
        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})


export const fetchAllStories = createAsyncThunk('/story/fetch-all-stories', async (userId: any) => {

    try {

        const response = await apiClient.get(FETCH_ALL_STORIES + '/' + userId)

        return response.data

    } catch (error: any) {
        throw new Error(error);

    }
})

export const deleteStory = createAsyncThunk('/story/delete-story', async (form: any) => {

    try {

        const response = await apiClient.put(DELETE_STORY_URL, form, jsonConfig)

        return response.data

    } catch (error: any) {
        throw new Error(error);

    }
})

export const fetchOthersStory = createAsyncThunk('/story/fetch-others-story', async (id: any) => {

    try {

        const response = await apiClient.get(FETCH_OTHERS_STORY_URL + '/' + id)

        return response.data

    } catch (error: any) {
        throw new Error(error);

    }
})

export const storySeen = createAsyncThunk('/story/story-seen', async (form: any) => {

    try {

        const response = await apiClient.put(STORY_SEEN_URL, form, jsonConfig)

        return response.data
    } catch (error: any) {
        throw new Error(error)
    }
})