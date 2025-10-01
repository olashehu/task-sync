import { IsString, IsNotEmpty } from 'class-validator';

export class InviteByIdentifierDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // email or username

  @IsString()
  @IsNotEmpty()
  teamId: string;
}
