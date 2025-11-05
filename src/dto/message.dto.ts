import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MessageRequestDTO {
  @IsNotEmpty()
  @IsString()
  query!: string;

  @IsNotEmpty()
  @IsOptional()
  room_id!: number | string;
}
