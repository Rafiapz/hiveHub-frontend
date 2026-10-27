import { createSlice } from "@reduxjs/toolkit";
import { fetchChats } from "../../actions/message/messageActions";


interface OutgoingCallData {
    receiverId: string;
    receiverData?: any;
}

interface MessagesState {
    conversations: any[];
    messages: any[];
    videoCall: boolean;
    outgoingCall: OutgoingCallData | null;
}

const initialState: MessagesState = {
    conversations: [],
    messages: [],
    videoCall: false,
    outgoingCall: null,
};

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
        startVideoCall: (state, action) => {
            state.outgoingCall = action.payload;
            state.videoCall = true;
        },
        clearOutgoingCall: (state) => {
            state.outgoingCall = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.messages = action?.payload?.data
            })
    }
})

export const { newMessage, handleVideoCallModal, startVideoCall, clearOutgoingCall } = messagesSlice.actions;

export default messagesSlice.reducer;    