import { GetStaticPaths, GetStaticPathsContext, InferGetServerSidePropsType, NextPage} from "next";
import Head from "next/head";
import { ssgHelper} from "~/server/api/ssgHelper"
import ErrorPage from "next/error"
import { api } from "~/utils/api";
import IconHoverEffect from "~/Components/IconHoverEffect";
import { VscArrowLeft } from "react-icons/vsc";
import Link from "next/link";
import ProfileImage from "~/Components/ProfileImage";
import InfiniteTweetsList from "~/Components/InfiniteTweets";
import { useSession } from "next-auth/react";
import Button from "~/Components/Button";

const pluralRules = new Intl.PluralRules();
function getPlural(number: number, singular: string, plural: string){
    return pluralRules.select(number) === "one" ? singular : plural;
}

type FollowBtnProps = {
    userId : string,
    isFollowing: boolean,
    onClick: () => void
}

function FollowButton({userId, isFollowing, onClick}: FollowBtnProps){

    const session = useSession();

    if(session.status !== 'authenticated'){
        return;
    }
    return <Button onClick={onClick} small gray={isFollowing}>{ isFollowing ? " Unfollow" : "follow"}</Button>
}

const ProfilePage: NextPage<InferGetServerSidePropsType<typeof getStaticProps>> = ({id}) =>{

    const {data: profile}: any = api?.profile.getById.useQuery({id});
    console.log({profile})
    const tweets = api.tweet.InfiniteProfileFeed.useInfiniteQuery({ userId: id},
        { getNextPageParam:(lastPage) => lastPage.nextCursor });
    // console.log("profile tweets",tweets.data)

    const trpcUtils = api.useContext();
    const toggleFollow = api.profile.toggleFollow.useMutation({ onSuccess:(
        {
            addedFollow
        }
    ) => {
        trpcUtils.profile.getById.setData({id}, oldData =>{
            if(oldData == null){
                return;
            }
            const countModifier = addedFollow ? 1 : -1;
            return {
                ...oldData,
            isFollowing: addedFollow,
            followersCount: oldData.followersCount + countModifier
            }
        })
    }})
    return (
        // <Head >
        //     <title>{`Twitter Clone - ${profile.name}`}</title>
        // </Head> 
                <header  className="sticky top-0 z-10 flex items-center
                border-b bg-white px-4 py-2">
                    <Link href=".." className="mr-2">
                        <IconHoverEffect>
                            <VscArrowLeft  className="h-6 w-6"/>
                        </IconHoverEffect>
                    </Link>
                    <ProfileImage src={profile.image} className="flex-shrink-0"/>
                    <div className="ml-2 flex-grow">
                        <h1 className="text-lg font-bold">{profile.name}</h1>   
                        <div className="text-gray-500">
                            {profile.tweetsCount}{" "}
                            {getPlural(profile.tweetsCount, "Tweet", "Tweets")} - {" "}
                            {profile.followersCount}{" "}
                            {getPlural(profile.followersCount, "Follower", "Followers")} - {" "}
                            {profile.FollowsCount} Following
                        </div>             
                    </div>

                    <FollowButton 
                    userId={id} 
                    isFollowing={profile.isFollowing} 
                    onClick={() =>  toggleFollow.mutate({ userId: id})}
                    />

                    <InfiniteTweetsList  
                        tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
                        isError={tweets.isError}
                        isLoading={tweets.isLoading}
                        hasMore={tweets?.hasNextPage}
                        fetchNewTweets={tweets.fetchNextPage}
                    />
                </header>
    )
}

export const getStaticPaths: GetStaticPaths = () =>{


    return{
        paths: [],
        fallback: "blocking"
    }
}

export async function getStaticProps(context: GetStaticPathsContext<{ id: string}>){

    console.log("params", context.params)
    const id = context.params?.id;

    if(id === null){
        return {
            redirect: {
                destination: "/"
            }
        }
    }

    const ssg = ssgHelper();
    await ssg.profile.getById.prefetch({id});


    return {
        props: {
            id,
            trpcState: ssg.dehydrate()
        }
    }
}
export default ProfilePage;