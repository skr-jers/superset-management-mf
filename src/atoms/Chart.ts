import {atom, useAtom} from 'jotai'
import {IChart} from '@/types/Chart'

export type SelectChart = IChart | undefined;

export const charts = atom<IChart[]>([]);
export const userCharts = atom<IChart[]>([]);

export const addCharts = atom(
    null,
    (_, set, fetchedDharts: IChart[]) => {
        set(charts, fetchedDharts);
    }
);

export const addUserDharts = atom(
    null,
    (_, set, fetchedDharts: IChart[]) => {
        set(userCharts, fetchedDharts);
    }
);

export const selectChart = atom<SelectChart>(undefined);

const useSelectChart = () => useAtom(selectChart);

export default useSelectChart;
