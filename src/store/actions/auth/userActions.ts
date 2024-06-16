import { createAsyncThunk } from "@reduxjs/toolkit";
import { IUserSignupdata } from "../../../interfaces/IUserSignup";
import { IOtp } from "../../../interfaces/IOtp";
import { IUserLogin } from "../../../interfaces/IUserLogin";
import apiClient from "../../../utils/axios";
import { jsonConfig, multiPartConfig } from "../../../utils/apiUtils";
import {
    CHANGE_PASSWORD_URL,
    EDIT_USER_IMAGES_URL,
    EDIT_USER_PASSWORD,
    EDIT_USER_PROFILE,
    FETCH_ALL_USERS,
    FETCH_OTHER_USER_URL,
    FETCH_USER_URL,
    LOGIN_URL,
    LOGOUT_URL,
    OTP_VERIFICATION_URL,
    RESEND_OTP_URL,
    SIGNUP_URL,
} from "../../../utils/endPoint";


export const signupAction = createAsyncThunk("/signup", async (userCredentials: IUserSignupdata, { }) => {
    try {
        const response = await apiClient.post(SIGNUP_URL, userCredentials, jsonConfig);

        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
});

export const otpVerification = createAsyncThunk("/otp-verification", async (data: IOtp, { }) => {
    try {
        const response = await apiClient.post(OTP_VERIFICATION_URL, data, jsonConfig);
        console.log(response.data);

        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
});

export const resendOtpAction = createAsyncThunk("/resend-otp", async (email: string | null) => {
    try {
        const response = await apiClient.get(`${RESEND_OTP_URL}?email=${email}`);

        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
});

export const loginAction = createAsyncThunk("/login", async (data: IUserLogin) => {
    try {
        const response = await apiClient.post(LOGIN_URL, data, jsonConfig);

        return response.data;
    } catch (error: any) {
        console.log('error', error);

        throw new Error(error.message);
    }
});


export const logoutAction = createAsyncThunk("/logout", async () => {
    try {

        const response = await apiClient.get(LOGOUT_URL);

        return response.data;
    } catch (error: any) {
        throw new Error(error)
    }
});

export const fetchuser = createAsyncThunk("/auth/fetch-user", async () => {
    try {
        const response = await apiClient.get(FETCH_USER_URL);

        if (response.data.status !== "ok") {
            throw new Error("Not authorized");
        }

        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
});

export const loginWithGoogle = createAsyncThunk("/auth/google", async (accessToken: any, { rejectWithValue }) => {
    try {
        const response = await apiClient.post("/auth/google", { googleAccesToken: accessToken });
        console.log(response.data);

        return response.data;
    } catch (error: any) {
        rejectWithValue(error.message);
    }
});

export const editUserImages = createAsyncThunk("/auth/edit-user-images", async ({ formData, type }: any) => {
    try {
        const response = await apiClient.post(`${EDIT_USER_IMAGES_URL}/image?${[type]}=${type}`, formData, multiPartConfig);
        console.log(response);
        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
});

export const editUserProfile = createAsyncThunk("/auth/edit-user-profile", async (form: any) => {
    try {
        const response = await apiClient.post(EDIT_USER_PROFILE, form, jsonConfig);
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
});

//EDITING FROM PROFILE

export const editUserPassword = createAsyncThunk("/auth/edit-user-password", async (form: any) => {
    try {
        const response = await apiClient.post(EDIT_USER_PASSWORD, form, jsonConfig);
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        throw new Error(error);
    }
});

//RESETING PASSWORD DUE TO FORGOT

export const changePassword = createAsyncThunk("/auth/change-password", async (form: any) => {
    try {
        console.log("pwd aclled");

        const response = await apiClient.post(CHANGE_PASSWORD_URL, form, jsonConfig);
        console.log(response.data);

        return response.data;
    } catch (error: any) {
        throw new Error(error);
    }
});

export const fetchAllUsers = createAsyncThunk("/auth/find-all-users", async () => {
    try {
        const response = await apiClient.get(FETCH_ALL_USERS);

        return response.data;
    } catch (error: any) {
        throw new Error(error);
    }
});

export const fetchOtherUser = createAsyncThunk('/auth/fetch-user', async (email: string) => {

    try {
        const response = await apiClient.get(`${FETCH_OTHER_USER_URL}?email=${email}`)

        return response.data
    } catch (error: any) {
        throw new Error(error)
    }

})


