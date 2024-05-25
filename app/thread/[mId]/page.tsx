import React from "react";

type MessagePageProps = {
  params: { mId: string };
};

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

const MessagePage = async ({ params }: MessagePageProps, {mails}) => {

  const thread = mails.filter((item: any) => item.id == params.mId)

  const getSubject = (mail: Message): string => {
    const sub = mail.payload.headers.filter(h => h.name === "Subject");
    if (sub != null && sub.length > 0) {
        return sub[0].value;
    }
    return "not found subject"
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-8">
        <div>thread: {getSubject(thread[0])}</div>
      </div>
    </div>
  );
};

export default MessagePage;