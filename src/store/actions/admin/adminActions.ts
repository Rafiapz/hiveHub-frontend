import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_FIND_ALL_USERS_URL, BLOCK_UNBLOCK_USER_URL, FETCH_ALL_REPORTS_URL, GET_ONLINE_USERS_URL } from "../../../utils/endPoint";
import apiClient from "../../../utils/axios";
import { jsonConfig } from "../../../utils/apiUtils";

export const adminFindAllUsers = createAsyncThunk('/admin/find-all-users', async (id: any) => {

    try {

        const response = await apiClient.get(ADMIN_FIND_ALL_USERS_URL + '/' + id)

        return response.data

    } catch (error) {
        console.log(error);

    }
})

export const blockOrUnblockUser = createAsyncThunk('/admin/block-unblock-user', async (form: any) => {

    try {

        const response = await apiClient.put(`${BLOCK_UNBLOCK_USER_URL}`, form, jsonConfig)

        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})

export const getOnlineUsers = createAsyncThunk('/admin/get-online-users', async () => {

    try {

        const response = await apiClient.get(GET_ONLINE_USERS_URL)

        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})

export const fetchAllReports = createAsyncThunk('/admin/fetch-all-reports', async () => {

    try {

        const response = await apiClient.get(FETCH_ALL_REPORTS_URL)

        return response.data

    } catch (error: any) {
        throw new Error(error);

    }
})
