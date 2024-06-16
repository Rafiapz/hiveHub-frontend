
export interface IUserSignupdata {
    fullName: string,
    profilePhoto?: string,
    coverPhoto?: string,
    email: string,
    password: string,
    role?: string,
    isActive?: boolean
    confirmPassword?: string
}