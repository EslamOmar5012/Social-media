export interface IAuthUser {
    id: string;
    username: string;
    email: string;
    phone?: string | undefined;
    role: string;
}

export interface ISignup {
    message: string;
    user: IAuthUser;
}

export interface ILogin {
    message: string;
    accessToken: string;
    refreshToken: string;
}

export interface IConfirmEmailRequest {
    email: string;
    otp: string;
}

export interface IResendConfirmEmailRequest {
    email: string;
}

export interface IResendConfirmEmail {
    message: string;
}

export interface IConfirmEmail {
    message: string;
}

export interface IForgotPasswordRequest {
    email: string;
}

export interface IForgotPassword {
    message: string;
}

export interface IResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

export interface IResetPassword {
    message: string;
}

export interface ILogoutRequest {
    email: string;
}
