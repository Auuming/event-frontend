import styles from './topmenu.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Link as MuiLink } from '@mui/material';
import TopMenuItem from './TopMenuItem';

export default async function TopMenu() {

  const session = await getServerSession(authOptions);

  return (
    <div className={styles.menucontainer}>
        <Link href={session ? '/user' : '/api/auth/signin'}>
          <Image src={'/img/user.png'} className={styles.logoImg} alt='user profile'
          width={0} height={0} sizes='100vh' style={{ cursor: 'pointer' }}/>
        </Link>
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
                <MuiLink href="/api/auth/signout">
                  <div className='flex items-center h-full px-2 text-cyan-600 text-sm'>
                    Sign-Out of {session.user?.name}
                  </div>
                </MuiLink>
              </>
            ) : (
              <>
                <MuiLink href="/api/auth/signin">
                  <div className='flex items-center h-full px-2 text-cyan-600 text-sm'>
                    Sign-In
                  </div>
                </MuiLink>
                <TopMenuItem title='Register' pageRef='/register'/>
              </>
            )
          }
        </div>
    </div>
  );
}