import {useCallback, useState} from "react";
import axios from "axios";

interface TokenRes {
    access_token: string,
    token_type: string,
    expires_in: string,
    scope: string
}

export const useGmail = () => {

    // apicall時に実際に使用するtokenとかを持ったResponse
    const [res, setRes] = useState<TokenRes | undefined>(undefined);
    const [hasError, setHasError] = useState<boolean>(false);

    // OAuthのcodeがすでに使われていたりした場合trueにする。
    const [invalidCode, setInvalidCode] = useState<boolean>(false);

    const clientId = "1031018594351-u3ug42nbaegfahpi918v6akn86ld0ufl.apps.googleusercontent.com";
    const clientSecret = "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";
    
    // ユーザーがOAuthで同意した後に戻ってくるリダイレクトURI。先にGoogleのOAuthで設定をする必要がある。
    const redirectUrl = "http://localhost:3000/portal";

    // 上記で設定したApiのScopeを入れる
    const apiScope = "https://www.googleapis.com/auth/gmail.readonly";

    // OAuthの同意画面への認証URLのベース 
    const urlBase = "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=";

    // https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps?hl=ja
    // https://developers.google.com/gmail/api/reference/rest

    // OAuthで取得したcodeとAccessTokenを引き換えるurlのベース。ここにはPostメソッドでRequestを投げる
    const getTokenUrl = "https://accounts.google.com/o/oauth2/token";

    // OAuthの同意画面のurlBaseとclientIdとかを使ってOAuthのendpointを作成する。 
    const gmailAuthEndpoint = `${urlBase}${clientId}&redirect_uri=${redirectUrl}&scope=${apiScope}`;

    // OAuthで取得したCodeをAccessTokenと引き換えるメソッド。本来ならdepsにclientIdやらclientSercretを入れたほうがいいけどいったんスルー
    const toAuthCode = useCallback((code: string) => {
        // ここのジェネリックを指定することでAxiosResponseのdataの型が決まる。
        axios.post<TokenRes>(getTokenUrl, {
            code: code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUrl,
            grant_type: "authorization_code",
        })
          .then(res => setRes(res.data))
          .catch(e => {
              // 確か200以外が返った場合はこっち。
              // invalid_grantが返ってきた場合、codeが使用済みのケースが多い。
              console.log(e.response.data.error)
              console.log({"error": e});
              if (e.response.data.error === "invalid_grant") {
                  //setInvalidCode(true)
              } else {
                  setHasError(true);
              }
          });
    }, [])

    return {gmailAuthEndpoint, toAuthCode, res, hasError, invalidCode}
}