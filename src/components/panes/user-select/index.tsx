import { IUser } from "@/types/User"
import { useAtom } from "jotai"
import useSelectUser, { users as usersState } from "@/atoms/User"
import { 
    Popover,
    PopoverTrigger,
    PopoverContent
 } from "@/components/ui/popover"
import {
    Command,
    CommandInput,
    CommandList,
    CommandItem,
    CommandEmpty,
    CommandGroup
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const UserSelect = () => {

    const [users, setUsers] = useAtom<IUser[]>(usersState)
    const [selectedUser, setSelectedUser] = useSelectUser()


    const fetchUsers = async (search: string) => {
        const formData = new URLSearchParams()
        formData.set('filter',search )

        const headers = new Headers()
        headers.set('Authorization', 'Basic ' + btoa("jonathan.ruiz" + ":" + "Ruijo/278420"));
        try {
            const response = await fetch("https://qakerno.sekura.mx/users/app/1/10", {
                method: 'POST',
                body: formData,
                headers
            })
            const data = await response.json()
            console.log(data);
            
            setUsers(data?.userAppList)
        } catch (error) {
            console.error(error)
        }
    }
    
    
    
    // UI state 
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    
    useEffect(() => {
        if (search.length > 0) {
            fetchUsers(search)
        }
    }, [search])
    return (
        <div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                    >
                        {selectedUser
                            ? users.find((user) => user.userId === selectedUser.userId)?.username
                            : "Select user..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command shouldFilter={false}>
                        <CommandInput placeholder="Search user..." value={search} onValueChange={setSearch} />
                        <CommandList>
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup>
                                {users.map((user) => (
                                    <CommandItem
                                        key={user.userId}
                                        value={user.userId.toString()}
                                        onSelect={(currentValue) => {
                                            setSelectedUser(users.find((user) => user.userId.toString() === currentValue))
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedUser?.userId === user.userId ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {user.username}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default UserSelect