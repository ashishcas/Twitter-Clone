import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import NewTweetForm from "~/Components/NewTweetForm";
import InfiniteTweetList from "~/Components/InfiniteTweets";

import { api } from "~/utils/api";
import { useState } from "react";

const TABS = ["Recent", "Following"] as const;
const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const session = useSession();
  const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("Recent");

  return (
    <>
     <header className="sticky top-0 z-10 border-b  bg-white pt-2">
      <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
      { session.status === 'authenticated' && 
        (
        <div className="flex">
          {TABS.map(tab =>{
              return(
                <button key={tab} className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 
                  ${tab === selectedTab ? "border-b-4 border-b-blue-500 font-bold": ""}`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              )
          })

          }
        </div>
        )
      }
     </header>
     <NewTweetForm />
     { selectedTab === "Recent" ? (
              <RecentTweets />
        ) : <FollowingTweets />
     }
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data: secretMessage } = api.example?.getSecretMessage?.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};


function RecentTweets(){
  const tweets = api.tweet.infiniteTweets.useInfiniteQuery({}, { getNextPageParam: (lastPage) => lastPage.nextCursor});


  return <InfiniteTweetList  
    tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
    isError={tweets.isError}
    isLoading={tweets.isLoading}
    hasMore={tweets?.hasNextPage}
    fetchNewTweets={tweets.fetchNextPage}
  />
    
}

function FollowingTweets(){
  const tweets = api.tweet.infiniteTweets.useInfiniteQuery(
    { onlyFollowing: true}, 
    { getNextPageParam: (lastPage) => lastPage.nextCursor}
  );

  return <InfiniteTweetList  
    tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
    isError={tweets.isError}
    isLoading={tweets.isLoading}
    hasMore={tweets?.hasNextPage}
    fetchNewTweets={tweets.fetchNextPage}
  />
    
}