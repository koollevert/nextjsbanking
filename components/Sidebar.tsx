'use client'

import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { sidebarLinks } from '@/constants'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const Sidebar = ({user}: SiderbarProps) => {
    const pathname=usePathname();
  return (
    <section>
        <nav className='flex flex-col gap-4'>
            <Link href="/" className='mb-12 cursor-pointer items-center gap-2'>
                <Image src='/icons/logo.svg' width={34} height={34} alt="Horizon logo" className="size[24px] max-xl:sixze-14"
                />
                <h1 className='sidebar-logo'>
                    Bankiko
                </h1>
            </Link>
            {sidebarLinks.map((item)=>{
                const isActive=pathname ===item.route || pathname.startsWith(`${item.route}/`)
                return(
                    <Link href={item.route} key={item.label} className={cn('sidebar-link', {'bg-bank-gradient': isActive})}>
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    </section>
    
  )
}

export default Sidebar