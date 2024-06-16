import * as yup from 'yup'


const fullNameReg: RegExp = /^[a-zA-Z ]{3,}$/
const passwordReg: RegExp = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{7,}$/

export const signupSchema = yup.object().shape({
    fullName: yup.string().trim().min(3).matches(fullNameReg, { message: 'Please enter a valid name' }).required('This field is required'),
    email: yup.string().trim().email('Please enter a valid email').required('This field is required'),
    password: yup.string().trim().min(6).matches(passwordReg, { message: 'Please enter a strong password' }).required('This field is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref("password")], 'Passwords must match').required('This field is required')

})

export const fullNameSchema = yup.object().shape({
    fullName: yup.string().trim().min(3).matches(fullNameReg, { message: 'Please enter a valid name' }).required('This field is required'),
})

export const emailSchema = yup.object().shape({
    email: yup.string().trim().email('Please enter a valid email').required('This field is required'),
})

export const passwordSchema = yup.object().shape({
    oldPassword: yup.string().trim().required('This field is required'),
    password: yup.string().trim().min(6).matches(passwordReg, { message: 'Please enter a strong password' }).required('This field is required'),
    confirmPassword: yup.string().trim().oneOf([yup.ref("password")], 'Passwords must match').required('This field is required')

})

export const resetPasswordSchema = yup.object().shape({
    password: yup.string().trim().min(6).matches(passwordReg, { message: 'Please enter a strong password' }).required('This field is required'),
    confirmPassword: yup.string().trim().oneOf([yup.ref("password")], 'Passwords must match').required('This field is required')
})




