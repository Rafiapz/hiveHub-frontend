import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/axios";
import { CONNECTION_REQUEST_URL, FETCH_ALL_NETWORKS, FETCH_FOLLOWERS_URL, FETCH_FOLLOWING_URL, UNFOLLOW_URL, } from "../../../utils/endPoint";


export const connectionRequestAction = createAsyncThunk('/network/connection-request', async ({ targetId, userId }: any, { rejectWithValue }) => {

    try {

        const response = await apiClient.post(`${CONNECTION_REQUEST_URL}/${userId}?target=${targetId}`)
        console.log(response.data);

        return response.data

    } catch (error: any) {
        console.log(error);
        rejectWithValue(error)
    }
})


export const fetchAllNetworks = createAsyncThunk('/network/fetchAll-networks', async () => {

    try {


        const response = await apiClient.get(FETCH_ALL_NETWORKS)

        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})

export const fetchFollwing = createAsyncThunk('/network/fetch-following', async () => {

    try {

        const response = await apiClient.get(FETCH_FOLLOWING_URL)

        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})

export const fetchFollowers = createAsyncThunk('/networks/fetch-followers', async () => {

    try {

        const response = await apiClient.get(FETCH_FOLLOWERS_URL)
        console.log(response.data, 'foll');

        return response.data

    } catch (error: any) {
        throw new Error(error)
    }
})

export const unFollow = createAsyncThunk('/network/unfollow', async (id: number) => {

    try {


        const reponse = await apiClient.delete(`${UNFOLLOW_URL}/${id}`)
        console.log(reponse.data, 'dtaaa');

        return reponse.data

    } catch (error: any) {
        throw new Error(error)
    }
})