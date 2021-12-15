const stringifyValue = (/** @type {Record<string, unknown>} */ o) =>
    Object.fromEntries(
        Object.entries(o)
            .map(([k, v]) => [k, v + ''])
    );

/**
 * Send login request
 * @param {{ username: string; password: string; loginURL: URL }} requestOptions
 * @return {Promise<{ code: string; message: string }>} the response object
 */
async function sendLoginRequest(
    {
        username,
        password,
        loginURL
    }
) {
    
    const VERSION = 0;
    const PORTAL_PAGE_ID = 1;

    const loginURLParams = loginURL.searchParams;

    const params = stringifyValue({
        userid: username,
        passwd: password,
        wlanuserip: loginURLParams.get('wlanuserip') ?? '',
        wlanacname: loginURLParams.get('wlanacname') ?? '',
        wlanacIp: loginURLParams.get('wlanuserip') ?? '',
        ssid: '',
        vlan: loginURLParams.get('vlan') ?? '',
        mac: encodeURIComponent(loginURLParams.get('mac') ?? ''),
        version: VERSION,
        portalpageid: PORTAL_PAGE_ID,
        timestamp: Date.now(),
        portaltype: ''
    });

    const requestParams = new URLSearchParams(params);

    const requestUrl = new URL(`${loginURL.origin}/quickauth.do?${requestParams}`);

    const resp = await fetch(requestUrl.toString(), { credentials: 'same-origin', mode: 'no-cors' });

    if (resp.ok) {
        return /** @type {{ code: string; message: string }} */ await resp.json();
    } else {
        throw new Error(`${resp.status}, ${resp.statusText}`);
    }
};

export {
    sendLoginRequest as login
}
