// dto/invite-member.dto.ts
import { IsUUID } from 'class-validator';

export class InviteMemberDto {
  // @IsUUID()
  // userId?: string;

  @IsUUID()
  teamId: string;
}
