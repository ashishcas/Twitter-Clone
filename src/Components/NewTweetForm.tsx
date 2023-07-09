import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import { api } from "~/utils/api"
import { FormEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";


function updateTextAreaSize(textArea?: HTMLTextAreaElement){
    if(textArea == null){
        return;
    }

    textArea.style.height = "0";
    textArea.style.height = `${textArea.scrollHeight}px`
}

function Form(): React.FC{

    const trpcUtils = api.useContext();
    const session = useSession();

    const [inputValue, setInputValue] = useState();
    const textAreaRef = useRef<HTMLTextAreaElement>();

    const inputRef = useCallback((textArea: HTMLTextAreaElement) =>{
        updateTextAreaSize(textArea);
        textAreaRef.current = textArea;
    },[])
    useLayoutEffect(()=>{
        updateTextAreaSize(textAreaRef.current);
    },[inputValue])

    const createTweet = api.tweet.create.useMutation({ onSuccess: (newTweet) =>{
       setInputValue(''); 

       if(session.status !== 'authenticated'){
            return;
       }
       trpcUtils.tweet.infiniteTweets.setInfiniteData({}, (oldData = {}) => { 
            if(oldData === null || oldData?.pages[0] === null){
                return;
            }
            const newCachedTweet = {
                ...newTweet,
                likeCount: 0,
                likedByMe: false,
                user : {
                    id: session.data?.user.id,
                    name: session.data.user.name || null,
                    image: session.data.user.image || null,
                }
            }

            return{
                ...oldData,
                page: [
                    {
                        ...oldData.pages[0],
                        tweets: [newCachedTweet, ...oldData.pages[0].tweets]
                    },
                    ...oldData.pages.slice(1),
                ]
            }
       })
    } });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        createTweet.mutate({ content: inputValue});
    }

    return(
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
            <div className="flex gap-4">
                <ProfileImage  src={session?.data?.user?.image}/>
                <textarea className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none" 
                placeholder="Whats Happening" 
                    style={{height: 0}}
                    value = {inputValue}
                    onChange={(e) =>
                        setInputValue(e.target.value)
                    }
                    ref={inputRef}
                />
            </div>
            <Button className="self-end">Tweet</Button>
        </form>
    )
}


function NewTweetForm(){
    const session = useSession();

    if(session.status !== "authenticated") return null;
    return <Form />
   
}

export default NewTweetForm;