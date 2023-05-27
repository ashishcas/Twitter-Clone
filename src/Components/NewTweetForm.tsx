import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";


function updateTextAreaSize(textArea?: HTMLTextAreaElement){
    if(textArea == null){
        return;
    }

    textArea.style.height = "0";
    textArea.style.height = `${textArea.scrollHeight}px`
}

function Form(): React.FC{

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

    return(
        <form className="flex flex-col gap-2 border-b px-4 py-2">
            <div className="flex gap-4">
                <ProfileImage  src={session.data.user.image}/>
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

    if(session.status !== "authenticated") return;
    return <Form />
   
}

export default NewTweetForm;