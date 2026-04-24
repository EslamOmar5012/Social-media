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
