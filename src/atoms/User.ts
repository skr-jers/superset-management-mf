import {atom, useAtom} from 'jotai'
import { IUser } from '@/types/User'

type SelectUser = IUser | undefined;

export const users = atom<IUser[]>([]);
export const selectedUser = atom<SelectUser>(undefined);

export const addUser = atom(
    null,
    (_, set, fetchedUsers: IUser[]) => {
        set(users, fetchedUsers);
    }
);

export const selectUser = atom<SelectUser>(undefined);

const useSelectUser = () => useAtom(selectUser);
export default useSelectUser;