import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAtom } from "jotai"
import { instances as instancesState } from "@/atoms/Instance"
import { useState } from "react"
import { Loader } from "lucide-react"
import axiosInstance from "@/lib/network"

type CreateInstanceProps = {
    selectedUser: number
}

const CreateInstance = ({  }: CreateInstanceProps) => {


    const [_, setInstances] = useAtom(instancesState)


    //UI state
    const [newInstance, setNewInstance] = useState({ name: '', url: '' })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchInstances = async () => {
        try {
            const response = await axiosInstance.get("/superset-management/instances")
            const data = response.data
            setInstances(data.data)
        } catch (err) {
        } finally {
        }
    }

    const handleCreateInstance = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.post('/superset-management/instances', newInstance)
            if (response.status === 200) {
                fetchInstances()
                setNewInstance({ name: '', url: '' })
            } else {
                setError('Failed to create instance')
            }
        } catch (err) {
            setError('Failed to create instance')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-start gap-2">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                    autoComplete='off'
                    id="name"
                    value={newInstance.name}
                    onChange={(e) => setNewInstance({ ...newInstance, name: e.target.value })}
                    className="col-span-3"
                />
            </div>
            <div className="flex flex-col items-start gap-2">
                <Label htmlFor="url" className="text-right">URL</Label>
                <Input
                    autoComplete='off'
                    id="url"
                    value={newInstance.url}
                    onChange={(e) => setNewInstance({ ...newInstance, url: e.target.value })}
                    className="col-span-3"
                />
            </div>
            <Button
                disabled={loading || !newInstance.name || !newInstance.url}
                onClick={handleCreateInstance}
                className="ml-auto" variant={"outline"}>
                Create Instance
                {loading && <Loader className="ml-2 animate-spin" />}
            </Button>
            {error && (
                <div className="text-red-500">{error}</div>
            )}
        </div>
    )
}

export default CreateInstance