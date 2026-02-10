"use client"
import { Briefcase } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Avatar, AvatarFallback } from './ui/avatar'
import { useSession, signOut } from '@/lib/auth/auth-client'
import router from 'next/navigation'


const Navbar = () => {

    const { data: session } = useSession();

    return (
        <nav className='border-b border-gray-200 bg-white'>
            <div className='container mx-auto flex h-16 items-center px-4 justify-between'>
                <Link href="/" className='flex items-center gap-2 text-xl font-semibold text-primary'>
                    <Briefcase />
                    Job Tracker
                </Link>
                <div className='flex items-center gap-4'>
                    {session?.user ? (
                        <>
                            <Link href="/dashboard">
                                <Button variant={"ghost"} className='text-gray-700 hover:text-black'>
                                    Dashboard
                                </Button>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity">
                                    <Avatar className='h-8 w-8'>
                                        <AvatarFallback className='bg-primary text-white'>
                                            {session.user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='w-56' align='end'>
                                    <DropdownMenuLabel className='font-normal'>
                                        <div className='flex flex-col space-y-1'>
                                            <p className='text-sm font-medium leading-none'>
                                                {session.user.name}
                                            </p>
                                            <p className='text-xs leading-none text-muted-foreground'>
                                                {session.user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem    onClick={async () => {
                                        const result = await signOut();
                                        if (result.data) {
                                            router.redirect("/sign-in");
                                        } else {
                                            alert("Failed to sign out");
                                        }
                                    }}>
                                        Log Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </>
                    ) : (<>
                        <Link href="/sign-in">
                            <Button variant={"ghost"} className='text-gray-700 hover:text-black'>
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button className='bg-primaryhover:bg-primary/90'>
                                Sign Up
                            </Button>
                        </Link>
                    </>)}
                </div>
            </div>
        </nav>
    )
}

export default Navbar


