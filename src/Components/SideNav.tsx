import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

function SideNav(){
    const session = useSession();
    const user = session.data?.user;
    console.log(user)
    return(
        <nav className="sticky top-0 self-start px-2 py-4">
            <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
                <li>
                    <Link href="/">Home</Link>
                </li>
                {
                   ( user !== null && user?.id)&& (
                        <li>
                        <Link href={`/profiles/${user.id}`}>Profile</Link>
                        </li>
                    )
                }

                { 
                    user ? (
                        <li>
                            <button onClick={() => void signOut()}>Log out</button>
                        </li>
                 ) :  (
                    <li>
                        <button onClick={() => void signIn()}>Log In</button>
                    </li>
             )
                }
            </ul>
        </nav>
    )
}

export default SideNav;