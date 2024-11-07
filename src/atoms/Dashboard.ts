import {atom, useAtom} from 'jotai'
import {IDashboard} from '@/types/Dashboard'

export type SelectDashboard = IDashboard | undefined;

export const dashboards = atom<IDashboard[]>([]);
export const userDashboards = atom<IDashboard[]>([]);

export const addDashboards = atom(
    null,
    (_, set, fetchedDashboards: IDashboard[]) => {
        set(dashboards, fetchedDashboards);
    }
);

export const addUserDashboards = atom(
    null,
    (_, set, fetchedDashboards: IDashboard[]) => {
        set(userDashboards, fetchedDashboards);
    }
);

export const selectDashboard = atom<SelectDashboard>(undefined);

const useSelectDashboard = () => useAtom(selectDashboard);

export default useSelectDashboard;
