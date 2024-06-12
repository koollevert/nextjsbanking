import Link from 'next/link'
import React from 'react'

const RecentTransactions = ({
    accounts,
    transactions=[],
    appwriteItemId,
    page=1
}: RecentTransactionsProps) => {
  return (
    <section className='recent-transactions'>
        <header className='flex items-center justify-between'>
            <h2 className='recent-transaction-label'>
                Recent transactions
            </h2>
            <Link href={`/transaction-history/?id=${appwriteItemId}`} className='view-all-btn'>
                View all
            </Link>
        </header>
    </section>
  )
}

export default RecentTransactions