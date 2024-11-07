'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAtom } from 'jotai'
import useSelectInstance, { addAllInstances, addUserInstances} from '@/atoms/Instance'
import useSelectDashboard from '@/atoms/Dashboard'
import useSelectChart from '@/atoms/Chart'
import UserInstances from './user-instances'
import CreateInstance from './create-instance/create-instance'
import DashboardsList from './dashboards-list'
import UserSelect from './user-select'
import useSelectUser from '@/atoms/User'
import ChartsList from './charts-list'
import axiosInstance from '@/lib/network'



export default function SupersetAdminPanel() {
  //const [instances, setInstances] = useState<Instance[]>([])
  const [, setInstances] = useAtom(addAllInstances);

  //const [userInstances, setUserInstances] = useState<Instance[]>([])
  const [, setUserInstances] = useAtom(addUserInstances);

  const [selectedUser] = useSelectUser()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const [, setSelectInstance] = useSelectInstance()
  const [, setSelectDashboard] = useSelectDashboard()
  const [, setSelectChart] = useSelectChart()

  useEffect(() => {
    if (selectedUser) {
      fetchInstances()
      fetchUserInstances(selectedUser.userId)
      setSelectInstance(undefined)
      setSelectDashboard(undefined)
      setSelectChart(undefined)
    }
  }, [selectedUser])




  const fetchInstances = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get("/superset-management/instances")
      const data = response.data
      setInstances(data.data)
    } catch (err) {
      setError('Failed to fetch instances')
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Superset Admin Panel</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className='flex gap-6'>

        <Card className="">
          <CardHeader>
            <CardTitle>Select User</CardTitle>
          </CardHeader>
          <CardContent>
            <UserSelect />
          </CardContent>
        </Card>

        {selectedUser && (
          <Tabs defaultValue="instances" className="w-full items-start">
            <TabsList>
              <TabsTrigger value="instances">Manage Instances</TabsTrigger>
              <TabsTrigger value="dashboards">Manage Dashboards</TabsTrigger>
              <TabsTrigger value="charts">Manage Charts</TabsTrigger>
            </TabsList>
            <TabsContent value="instances">
              <Card>
                <CardHeader>
                  <CardTitle>User Instances</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserInstances selectedUser={selectedUser.userId} /> {/* This is a independent component */}
                </CardContent>
                <CardHeader>
                  <CardTitle>Create New Instance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreateInstance selectedUser={selectedUser.userId} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="dashboards">
              <Card>
                <CardHeader>
                  <CardTitle>Instance Dashboards</CardTitle>
                </CardHeader>
                <CardContent>
                  <DashboardsList selectedUser={selectedUser.userId} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="charts">
              <Card>
                <CardHeader>
                  <CardTitle>Instance Charts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartsList selectedUser={selectedUser.userId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

      </div>

    </div>
  )
}