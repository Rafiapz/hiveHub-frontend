import { createSlice } from "@reduxjs/toolkit";
import { fetchAllNetworks, fetchFollowers, fetchFollwing } from "../../actions/network/networkActions";


const initialState = {

    network: {
        loading: false,
        error: null,
        data: null
    },
    following: {
        data: null
    },
    followers: {
        data: null,
        modal: false,
        curId: 0
    }
}

const networkSlice = createSlice({
    name: 'networks',
    initialState: initialState,
    reducers: {
        handleUnfollowModal: (state, action) => {
            state.followers.modal = action?.payload?.status
            state.followers.curId = action?.payload?.curId
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllNetworks.fulfilled, (state, action) => {
                state.network.data = action?.payload?.data
            })
            .addCase(fetchFollwing.fulfilled, (state, action) => {
                state.following.data = action?.payload?.data

            })
            .addCase(fetchFollowers.fulfilled, (state, action) => {
                state.followers.data = action?.payload?.data
            })
    }

})


export const { handleUnfollowModal } = networkSlice.actions;



export default networkSlice.reducer;    