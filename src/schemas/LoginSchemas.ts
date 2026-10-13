import * as yup from 'yup'


const passwordReg: RegExp = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{7,}$/

export const loginSchema = yup.object().shape({

    email: yup.string().trim().email('Please enter a valid email').required('This field is required'),
    password: yup.string().trim().min(6).matches(passwordReg, { message: 'Please enter a strong password' }).required('This field is required'),


})