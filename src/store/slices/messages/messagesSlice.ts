import { createSlice } from "@reduxjs/toolkit";
import { fetchChats } from "../../actions/message/messageActions";


const initialState = {

    conversations: [],
    messages: [],
    videoCall: false

}

const messagesSlice = createSlice({
    name: 'messages',
    initialState: initialState,
    reducers: {
        newMessage: (state, action) => {
            state.messages = action?.payload?.data
        },
        handleVideoCallModal: (state, action) => {
            state.videoCall = action?.payload?.status
        },

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.messages = action?.payload?.data
            })
    }
})


export const { newMessage, handleVideoCallModal } = messagesSlice.actions;



export default messagesSlice.reducer;    