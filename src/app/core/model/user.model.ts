import { UserType } from "./usertype.model";

  export class User {
      userId: string;
      username: string;
      userType: UserType;
      roleIds: string;
      enable:boolean;
  }
