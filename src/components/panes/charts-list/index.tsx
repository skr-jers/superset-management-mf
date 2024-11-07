import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAtom } from "jotai"
import useSelectDashboard, { userDashboards as userDashboardsState } from "@/atoms/Dashboard"
import { charts as chartsState, userCharts as userChartsState } from "@/atoms/Chart"
import { useEffect, useState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { IChart } from "@/types/Chart"
import useSelectInstance from "@/atoms/Instance"
import axiosInstance from "@/lib/network"



type ChartsListProps = {
    selectedUser: number
}

const ChartsList = ({ selectedUser }: ChartsListProps) => {
    //UI state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    //Data state
    const [userDashboards] = useAtom(userDashboardsState)
    const [selectDashboard, setSelectedDashboard] = useSelectDashboard() // SelectInstance atom
    const [selectInstance] = useSelectInstance() // SelectInstance atom

    //All charts for the selected dashboard
    const [charts, setCharts] = useAtom(chartsState) // Dashboards atom
    // Charts linked to the selected user
    const [linkedCharts, setLinkedCharts] = useAtom(userChartsState) // LinkedDashboards atom


    const fetchDashboardCharts = async (dashboardId: number) => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/superset-management/charts/instance/${selectInstance?.id}/dashboard/${dashboardId}`)
            const data = await response.data
            setCharts(data.data)
        } catch (err) {
            setError('Failed to fetch dashboard charts')
        } finally {
            setLoading(false)
        }
    }

    const fetchUserCharts = async (userId: number) => {
        if (!selectDashboard) return
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/superset-management/charts/dashboard/${selectDashboard.id}/user/${userId}`)
            const data = response.data
            setLinkedCharts(data.data)
        } catch (err) {
            setError('Failed to fetch user charts')
        } finally {
            setLoading(false)
        }
    }

    const isLinked = (chartId: number) => linkedCharts.some((chart) => chart.chartId === chartId)


    const handleLinkChart = async (chart: IChart) => {
        if (!selectedUser || !selectDashboard) return
        try {
            setLoading(true)
            const response = axiosInstance.post('/superset-management/charts/link', {
                chart: {
                    dashboardId: selectDashboard.id,
                    chartId: chart.chartId,
                    name: chart.name,
                    url: chart.url,
                },
                userId: selectedUser,
            })
            if ((await response).status === 200) {
                fetchUserCharts(selectedUser)
            } else {
                setError('Failed to link chart to user')
            }
        } catch (err) {
            setError('Failed to link chart to user')
        } finally {
            setLoading(false)
        }
    }

    const handleUnlinkChart = async (chartId: string) => {
        if (!selectedUser) return
        try {
            setLoading(true)
            const response = axiosInstance.post('/superset-management/charts/unlink', {
                chartId,
                userId: selectedUser,
            })
            if ((await response).status === 200) {
                fetchUserCharts(selectedUser)
            } else {
                setError('Failed to unlink charts from user')
            }
        } catch (err) {
            setError('Failed to unlink charts from user')
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (selectDashboard) {
            fetchDashboardCharts(selectDashboard.dashboardId)
        }
    }, [selectDashboard])

    useEffect(() => {
        if (selectedUser && selectDashboard) {
            fetchUserCharts(selectedUser)
        }
    }, [selectedUser, selectDashboard])

    return (
        <div className="flex flex-col gap-6">
            <Select onValueChange={(value) => setSelectedDashboard(userDashboards.find((dashboard) => dashboard.id === value) || undefined)} value={selectDashboard?.id}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a dashboard" />
                </SelectTrigger>
                <SelectContent>
                    {userDashboards.map((dashboard) => (
                        <SelectItem key={dashboard.id} value={dashboard.id}>{dashboard.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {loading && (
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}
            {selectDashboard && (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {charts.map((chart) => (
                                <TableRow key={chart.dashboardId}>
                                    <TableCell>{chart.name}</TableCell>
                                    <TableCell>{chart.url}</TableCell>
                                    <TableCell className="flex">
                                        <Checkbox
                                            checked={isLinked(chart.chartId)}
                                            onCheckedChange={(value) => {
                                                if (value) {
                                                    handleLinkChart(chart)
                                                } else {
                                                    handleUnlinkChart(linkedCharts.find((d) => d.chartId === chart.chartId)!.id)
                                                }
                                            }}
                                            aria-label="Select row"
                                            className="translate-y-[2px]"
                                        />
                                        <span className="ml-2">Linked</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

export default ChartsList