"use client"

import React, {useEffect, useState} from "react"
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@nextui-org/react"

interface Message {
    "id": string,
    "threadId": string,
    "labelIds": [
        string
    ],
    "snippet": string,
    "historyId": string,
    "internalDate": string,
    "sizeEstimate": number,
    "raw": string,
    "payload": {
        "partId": string,
        "mineType": string,
        "filename": string,
        "headers": [
            {
                "name": string,
                "value": string
            }
        ],
        "body": {
            "attachmentId": string,
            "size": number,
            "data": string
        },
    },
}

export const Sidebar = ({mails}) => {
    const [thread, setThread] = useState<Message>();
    const [referMails, setReferMails] = useState<Message[]>([]);
    let mailMap = new Map();

    useEffect(() => {
        console.log(mails);
        setThread(mails[0]);
    }, []);

    const getSubject = (mail: Message): string => {
        const sub = mail.payload.headers.filter(h => h.name === "Subject");
        if (sub != null && sub.length > 0) {
            return sub[0].value;
        }
        return "not found subject"
    }

    const getContent = (mail: Message): string => {
        const sub = mail.payload.headers.filter(h => h.name === "Body");
        if (sub != null && sub.length > 0) {
            return sub[0].value;
        }

        return "not found subject"
    }

    const getSender = (mail: Message): string => {
        const sub = mail.payload.headers.filter(h => h.name === "From");
        if (sub != null && sub.length > 0) {
            return sub[0].value;
        }
        return "not found subject"
    }

    let content = "";

    const findThread = (mail: Message) => {
        setThread(mail);
    }

    return (
        <>
        <aside className="hidden md:block fixed  w-80 inset-y-0 z-30">
        <div className="w-full h-full bg-gray-100/70 border-zinc-300/20 border-r-2 flex flex-col">
            <ScrollArea className="px-1 pb-4 grow">
            <>
                {mails.map((m, index) => {
                    return <>
                        <div
                            key={m.id}
                            className="flex items-center space-x-2 rounded-md p-2 mb-2  hover:bg-zinc-200/70 transition"
                        >
                            <Button onClick={() => findThread(m)} className="w-64">
                                <p className="text-left">
                                {getSender(m)}
                                </p>
                            </Button>
                        </div>
                    </>
                })}
            </>
            </ScrollArea>
            <div className="grow-0 shrink-0">
                <div className="rounded py-2 bg-gray-100/70">ユーザーボタン</div>
            </div> 
        </div>
        </aside>
        {
        mails.length > 0 && thread != null &&
        <main className="md:pl-80 h-full">
            {mails.filter(x => getSender(x) == getSender(thread)).map((m, index) => {
                return <>
                    <div key={m.id}>
                    <div>{getSubject(m)}</div>
                    <div className="pb-5">{m.snippet}</div>
                    </div>
                </>
            })}
        </main>
        }
        </>
    )
}