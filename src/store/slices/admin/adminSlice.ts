import { createSlice } from "@reduxjs/toolkit";
import { fetchAllReports } from "../../actions/admin/adminActions";

const initialState = {

    reports: {
        data: null
    }


}

const adminSlice = createSlice({
    name: 'admin',
    initialState: initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllReports.fulfilled, (state, action) => {
                state.reports.data = action?.payload?.data
            })

    }
})


export const { } = adminSlice.actions;



export default adminSlice.reducer;    