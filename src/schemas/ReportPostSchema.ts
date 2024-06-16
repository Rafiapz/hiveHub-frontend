import * as yup from 'yup'



export const reportSchema = yup.object().shape({

    option: yup.string().trim().required('Please choose a reason'),


})