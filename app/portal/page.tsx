"use client"
import React, {useCallback, useEffect, useState} from 'react';
import { useGmail } from '../lib/useGmail';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
//import { useRouter } from 'next/router';
import { Sidebar } from '../components/navigation/Sidebar';
import axios from 'axios';

interface UserProfileRes {
    emailAddress: string,
    messagesTotal: number,
    threadsTotal: number,
    historyId: string
}

interface MailListRes {
    "messages": MessageList[],
    "nextPageToken": string,
    "resultSizeEstimate": number
}

interface MessageList {
    id: string,
    threadId: string,
}

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

export default function Index() {
    const [profile, setProfile] = useState<UserProfileRes | undefined>(undefined);
    const [mailList, setMailList] = useState<MailListRes | undefined>(undefined);
    const [mails, setMails] = useState<Message[]>([]);

    const {gmailAuthEndpoint, toAuthCode, res, hasError, invalidCode} = useGmail();

    const router = useSearchParams();
    const code = router.get('code');
    console.log('64', router);
    //const code = usePathname();

    useEffect(() => {
        if (code != null) {
            toAuthCode(code as string);
        }
    }, [code])

    const endpoint = `https://gmail.googleapis.com/gmail/v1/users/${'sig.rain.ou@gmail.com'}/profile`;
    const mailEndpoint = `https://gmail.googleapis.com/gmail/v1/users/${'sig.rain.ou@gmail.com'}/messages`;

    const getProfile = useCallback(() => {
        if (res?.access_token != null) {
            axios.get<UserProfileRes>(endpoint, {
                headers: {
                    Authorization: `Bearer ${res.access_token}`,
                }
            }).then(res => setProfile(res.data))
        }
    }, [res])

    const getEmail = useCallback(() => {
        if (res?.access_token != null) {
            axios.get<MailListRes>(mailEndpoint, {
                headers: {
                    Authorization: `Bearer ${res.access_token}`,
                },
                params: {
                    maxResults: 500,
                    includesSpamTrash: false,
                    q: "After: 2024/05/08"
                }
            }).then(res => setMailList(res.data))
        }
    }, [res])

    useEffect(() => {
        if (mailList != null && res != null) {
            const data = mailList.messages.map(async (mail: MessageList) => {
                const endpoint = `https://gmail.googleapis.com/gmail/v1/users/${'sig.rain.ou@gmail.com'}/messages/${mail.id}`;
                return await axios.get<Message>(endpoint, {
                    headers: {
                        Authorization: `Bearer ${res.access_token}`,
                    }
                })
            })

            Promise.all(data).then(result => {
                const arr = result.map(r => r.data)
                for (let i = 0; i < arr.length; i++) {
                    if (arr.includes(getSubject(arr[i]))) {
                        delete arr[i];
                    }
                }
                setMails(arr);
            });
        }
    }, [mailList])

    const getSubject = (mail: Message): string => {
        const sub = mail.payload.headers.filter(h => h.name === "Subject");
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

    return (
        <div>
          {
            mails.length == 0 &&
            <>
            <p>login page.</p>
                <button onClick={() => {window.location.href = gmailAuthEndpoint }}>認証</button>
            <p>{code}</p>
            </>
          }
          {
            hasError && <p>エラーがあります。再認証してください。</p>
          }
          {
            invalidCode && <p>認証に失敗しました。再度認証してください。</p>
          }
          {res && mails.length == 0 &&
              <>
                  <ul>
                      <li>accessToken: {res.access_token}</li>
                      <li>refreshToken: {res.scope}</li>
                      <li>expiresIn: {res.expires_in}</li>
                      <li>tokenType: {res.token_type}</li>
                  </ul>
                  <button onClick={getProfile}>プロフィール取得</button>
              </>
          }
          {
            // Profileが取得出来たらここに表示するようにする。
            profile && mails.length == 0 &&
              <>
                  <ul>
                      <li>emailAddress: {profile.emailAddress}</li>
                      <li>historyId: {profile.historyId}</li>
                      <li>messagesTotal: {profile.messagesTotal}</li>
                      <li>threadsTotal: {profile.threadsTotal}</li>
                  </ul>
                  <button onClick={getEmail}>get mail</button>
              </>
          }
          {
            // mailの詳細get後に一気に表示されるようにする。
            mails.length > 0 &&
            <div className="h-full w-full">
                <Sidebar mails={mails}/>
            </div>
            /*
            <>
              {mails.map((m, index) => {
                return <>
                  <ul>
                    <li>{getSender(m)}</li>
                    <li>{getSubject(m)}</li>
                    <li>snippet: {m.snippet}</li>
                  </ul>
                </>
              })}
            </>
            */
          }
        </div>
    );    
}