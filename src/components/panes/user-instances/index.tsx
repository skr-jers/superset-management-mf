import {
    userInstances as userInstancesState,
    instances as instancesState,
} from "@/atoms/Instance"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table"
import axiosInstance from "@/lib/network"
import { useAtom } from "jotai"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Component for displaying user instances
 */
type UserInstancesProps = {
    selectedUser: number
}
const UserInstances = ({ selectedUser }: UserInstancesProps) => {

    // Instances that are linked to the selected user
    const [userInstances, setUserInstances] = useAtom(userInstancesState)
    // All instances available in the system
    const [instances, __] = useAtom(instancesState)

    // Helper function to check if an instance is linked to the selected user
    const isLinked = (instanceId: string) => userInstances.some((instance) => instance.id === instanceId)

    //UI state
    const [_, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUserInstances = async (userId: number) => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/superset-management/instances/user/${userId}`)
            const data = response.data
            setUserInstances(data.data)
        } catch (err) {
            setError('Failed to fetch user instances')
        } finally {
            setLoading(false)
        }
    }

    const handleLinkInstance = async (instanceId: string) => {
        if (!selectedUser) return
        try {
            setLoading(true)
            const response = await axiosInstance.post(`/superset-management/instances/user/${selectedUser}/link`, { instanceId })
            if (response.status === 200) {
                fetchUserInstances(selectedUser)
            } else {
                setError('Failed to link instance to user')
            }
        } catch (err) {
            setError('Failed to link instance to user')
        } finally {
            setLoading(false)
        }
    }

    const handleUnlinkInstance = async (instanceId: string) => {
        if (!selectedUser) return
        try {
            setLoading(true)
            const response = await axiosInstance.delete(`/superset-management/instances/user/${selectedUser}/unlink/${instanceId}`)
            if (response.status === 200) {
                fetchUserInstances(selectedUser)
            } else {
                setError('Failed to unlink instance from user')
            }
        } catch (err) {
            setError('Failed to unlink instance from user')
        } finally {
            setLoading(false)
        }
    }

    // Clean error state after 5 seconds
    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => {
                setError(null)
            }, 5000)
            return () => clearTimeout(timeout)
        }
    }, [error])



    return (
        <div className="relative rounded-md border">
            {error && (
                <Alert variant="destructive" className="absolute right-0 w-fit p-2 bg-destructive text-destructive-foreground z-10 shadow-lg animate-in animate-out text-sm">

                    <AlertTitle className="flex gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </AlertTitle>
                </Alert>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {instances.map((instance) => (
                        <TableRow key={instance.id}>
                            <TableCell>{instance.name}</TableCell>
                            <TableCell>{instance.url}</TableCell>
                            <TableCell>{instance.status}</TableCell>
                            <TableCell className="flex">
                                <Checkbox
                                    checked={isLinked(instance.id)}
                                    onCheckedChange={(value) => {
                                        if (value) {
                                            handleLinkInstance(instance.id)
                                        } else {
                                            handleUnlinkInstance(instance.id)
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

    )
}

export default UserInstances