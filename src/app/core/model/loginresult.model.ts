import { Gender } from './gender.model';
import { Role } from './role.model';
import { UserType } from './usertype.model';

export class LoginResult {
  userId: string;
  username: string;
  userType: UserType;
  fullName: string;
  firtstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
  gender: Gender;
  role:Role;
  userTypeIdentityId:string;
  userProfilePic:any;
}
