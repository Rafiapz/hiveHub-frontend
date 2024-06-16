import * as yup from 'yup'

export const pollQuestionSchema = yup.object().shape({
    question: yup.string().trim().required('Question is required'),
    options: yup.array().of(
        yup.object().shape({
            id: yup.number().required(),
            option: yup.string().trim().required('Option is required'),
            votes: yup.number().required('Votes is required').min(0),
        })
    ),
})


