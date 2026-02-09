import { Briefcase } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Navbar = () => {
    return (
        <nav className='border-b border-gray-200 bg-white'>
            <div className='container mx-auto flex h-16 items-center px-4'>
                <Link href="/" className='flex items-center gap-2 text-xl font-semibold text-primary'>
                    <Briefcase />
                    Job Application Tracker
                </Link>

            </div>
        </nav>
    )
}

export default Navbar