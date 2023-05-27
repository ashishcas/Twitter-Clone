import Image from "next/image";

type ProfileProps = {
    src?: string | null
    className?: string
}

const ProfileImage = ({
    src,
    className = ""
}: ProfileProps) =>{

    return(
        <div className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}>
            {
                src === null ? null : <Image src={src} alt="Profile Image" quality={100} width={200} height={200}></Image>
            }
        </div>
    )
}

export default ProfileImage;