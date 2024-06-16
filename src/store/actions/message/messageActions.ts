import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/axios";
import { CREATE_CONVERSATION_URL, CREATE_MESSAGE_URL, FETCH_MESSAGES_URL } from "../../../utils/endPoint";
import { jsonConfig, multiPartConfig } from "../../../utils/apiUtils";


export const createConversation = createAsyncThunk('/chats/create-conversation', async (form: any) => {

    try {

        const response = await apiClient.post(CREATE_CONVERSATION_URL, form, jsonConfig)

        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})

export const createMessage = createAsyncThunk('/chats/create-message', async ({ form, type }: any) => {

    try {

        const response = await apiClient.post(CREATE_MESSAGE_URL + '/' + type, form, multiPartConfig)

        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})



export const fetchChats = createAsyncThunk('/chats/fetch-messages', async (conversationId: string) => {

    try {

        const response = await apiClient.get(`${FETCH_MESSAGES_URL}/${conversationId}`)

        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})







