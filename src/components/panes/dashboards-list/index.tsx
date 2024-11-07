import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAtom } from "jotai"
import useSelectInstance, { userInstances as userInstancesState } from "@/atoms/Instance"
import { dashboards as dashboardsState, userDashboards as userDashboardsState } from "@/atoms/Dashboard"
import { useEffect, useState } from "react"
import { IDashboard } from "@/types/Dashboard"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import axiosInstance from "@/lib/network"



type DashboardsListProps = {
    selectedUser: number
}

const DashboardsList = ({ selectedUser }: DashboardsListProps) => {
    //UI state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    //Data state
    const [userInstances] = useAtom(userInstancesState)
    const [selectedInstance, setSelectedInstance] = useSelectInstance() // SelectInstance atom

    //All dashboards for the selected instance
    const [dashboards, setDashboards] = useAtom(dashboardsState) // Dashboards atom
    // Dashborads linked to the selected user
    const [linkedDashboards, setLinkedDashboards] = useAtom(userDashboardsState) // LinkedDashboards atom


    const fetchInstanceDashboards = async (instanceId: string) => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/superset-management/dashboards/instance/${instanceId}`)
            const data = response.data
            setDashboards(data.data)
        } catch (err) {
            setError('Failed to fetch instance dashboards')
        } finally {
            setLoading(false)
        }
    }

    const fetchUserDashboards = async (userId: number) => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/superset-management/dashboards/user/${userId}`)
            const data = response.data
            setLinkedDashboards(data.data)
        } catch (err) {
            setError('Failed to fetch user dashboards')
        } finally {
            setLoading(false)
        }
    }

    const isLinked = (dashboardId: number) => linkedDashboards.some((dashboard) => dashboard.dashboardId === dashboardId)


    const handleLinkDashboard = async (dashboard: IDashboard) => {
        if (!selectedUser || !selectedInstance) return
        try {
            setLoading(true)
            const response = await axiosInstance.post('/superset-management/dashboards/link', {
                dashboard: {
                    supersetInstanceId: selectedInstance.id,
                    dashboardId: dashboard.dashboardId,
                    name: dashboard.name,
                    url: dashboard.url,
                },
                userId: selectedUser,
            })
            if (response.status === 200) {
                fetchUserDashboards(selectedUser)
            } else {
                setError('Failed to link dashboard to user')
            }
        } catch (err) {
            setError('Failed to link dashboard to user')
        } finally {
            setLoading(false)
        }
    }

    const handleUnlinkDashboard = async (dashboardId: string) => {
        if (!selectedUser) return
        try {
            setLoading(true)
            const response = await axiosInstance.post('/superset-management/dashboards/unlink', {
                dashboardId,
                userId: selectedUser,
            })

            if (response.status === 200) {
                fetchUserDashboards(selectedUser)
            } else {
                setError('Failed to unlink dashboard from user')
            }
        } catch (err) {
            setError('Failed to unlink dashboard from user')
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (selectedInstance) {
            fetchInstanceDashboards(selectedInstance.id)
        }
    }, [selectedInstance])

    useEffect(() => {
        if (selectedUser) {
            fetchUserDashboards(selectedUser)
        }
    }, [selectedUser])

    return (
        <div className="flex flex-col gap-6">
            <Select onValueChange={(value)=> setSelectedInstance(userInstances.find((instance) => instance.id === value) || undefined)} value={selectedInstance?.id}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select an instance" />
                </SelectTrigger>
                <SelectContent>
                    {userInstances.map((instance) => (
                        <SelectItem key={instance.id} value={instance.id}>{instance.name}</SelectItem>
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
            {selectedInstance && (
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
                            {dashboards.map((dashboard) => (
                                <TableRow key={dashboard.dashboardId}>
                                    <TableCell>{dashboard.name}</TableCell>
                                    <TableCell>{dashboard.url}</TableCell>
                                    <TableCell className="flex">
                                        <Checkbox
                                            checked={isLinked(dashboard.dashboardId)}
                                            onCheckedChange={(value) => {
                                                if (value) {
                                                    handleLinkDashboard(dashboard)
                                                } else {
                                                    handleUnlinkDashboard(linkedDashboards.find((d) => d.dashboardId === dashboard.dashboardId)!.id)
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

export default DashboardsList