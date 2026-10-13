import axios, { AxiosError } from "axios";
import { BASE_URL } from "./endPoint";


const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

apiClient.interceptors.request.use((config) => {


    return config
},
    (error: AxiosError) => {

        return Promise.reject(error)
    }

)

apiClient.interceptors.response.use((response) => {

    return response
},
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

export default apiClient

