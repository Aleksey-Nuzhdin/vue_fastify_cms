import type { UserRole, UserBase } from './user.types.shared'

//Base
interface ProfileBase 
  extends Omit<UserBase, 'password'> {}

export interface ProfileResponse extends ProfileBase {}

export interface UpdateProfileDto 
  extends Partial<Omit<ProfileBase, '_id' | 'role' | 'email'>> {}

export interface UpdateProfileResponse extends ProfileBase {}

