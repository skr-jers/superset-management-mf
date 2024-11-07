import {atom, useAtom} from 'jotai'
import {IInstance} from '@/types/Instance'

type SelectInstance = IInstance | undefined;

export const instances = atom<IInstance[]>([]);

export const userInstances = atom<IInstance[]>([]);

export const addUserInstances = atom(
    null,
    (_, set, fetchedInstances: IInstance[]) => {
        set(userInstances, fetchedInstances);
    }
);

export const addAllInstances = atom(
    null,
    (_, set, fetchedInstances: IInstance[]) => {
        set(instances, fetchedInstances);
    }
)

export const selectInstance = atom<SelectInstance>(undefined);

const useSelectInstance = () => useAtom(selectInstance);
export default useSelectInstance;