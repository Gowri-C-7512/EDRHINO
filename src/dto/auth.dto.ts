import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RegisterRequestDTO {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsIn(['admin', 'user'])
    role!: 'admin' | 'user';
}

export class LoginRequestDTO {
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}

export class ForgotRequestDTO {
    @IsEmail()
    @IsNotEmpty()
    email!: string;
}

export class ResetRequestDTO {
    @IsString()
    @IsNotEmpty()
    token!: string;

    @IsString()
    @IsNotEmpty()
    new_password!: string;
}

export class GoogleSignInDTO {
    @IsString()
    @IsNotEmpty()
    token!: string;
}

export class LogoutRequestDTO {
    @IsString()
    @IsNotEmpty()
    refreshToken!: string;
}

export class RefreshRequestDTO {
    @IsString()
    @IsNotEmpty()
    refreshToken!: string;
}

export class QuestionRequestDTO {
    @IsString()
    @IsNotEmpty()
    subject!: string;

    @IsString()
    @IsNotEmpty()
    standard!: string;

    @IsString()
    @IsNotEmpty()
    token!: string;
}
