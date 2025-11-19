import styles from './topmenu.module.css';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Link } from '@mui/material';
import TopMenuItem from './TopMenuItem';

export default async function TopMenu() {

  const session = await getServerSession(authOptions);

  return (
    <div className={styles.menucontainer}>
        <Image src={'/img/logo.png'} className={styles.logoImg} alt='logo'
        width={0} height={0} sizes='100vh'/>
        <div className='flex flex-row'>
          <TopMenuItem title='Events' pageRef='/events'/>
          {session?.user?.role === 'admin' && (
            <TopMenuItem title='Manage Events' pageRef='/events/manage'/>
          )}
          {session?.user?.role === 'admin' ? (
            <TopMenuItem title='Reservation' pageRef='/reservations'/>
          ) : session?.user?.role === 'member' ? (
            <TopMenuItem title='Reservation' pageRef='/mybooking'/>
          ) : (
            <TopMenuItem title='Reservation' pageRef='/api/auth/signin'/>
          )}
          <TopMenuItem title='Home' pageRef='/'/>
        </div>
        <div className='flex flex-row absolute left-0 h-full'>
          {
            session? (
              <>
                <Link href="/api/auth/signout">
                  <div className='flex items-center h-full px-2 text-cyan-600 text-sm'>
                    Sign-Out of {session.user?.name}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/api/auth/signin">
                  <div className='flex items-center h-full px-2 text-cyan-600 text-sm'>
                    Sign-In
                  </div>
                </Link>
                <TopMenuItem title='Register' pageRef='/register'/>
              </>
            )
          }
        </div>
    </div>
  );
}