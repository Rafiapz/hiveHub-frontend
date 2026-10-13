import * as yup from 'yup'

export const commentSchema = yup.object().shape({
    comment: yup.string().trim().required('Please enter a comment'),
})

export const replyCommentSchema = yup.object().shape({
    reply: yup.string().trim().required('Please enter a comment'),
})
