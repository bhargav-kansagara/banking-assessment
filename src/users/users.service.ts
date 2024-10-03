import * as DynemoDbService from "@/common/database/database.service";
import { User } from "@/users/user.interface";

export const get = async (id: string): Promise<User> => {
  const user = await DynemoDbService.getItem(
    { id },
    DynemoDbService.UsersTableName,
  );
  return user as User;
};

export const create = async (item: User) => {
  const user = await DynemoDbService.createItem(
    item,
    { id: item.id },
    DynemoDbService.UsersTableName,
  );
  return user as User;
};
