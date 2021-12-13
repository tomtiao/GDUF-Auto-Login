const stringifyValue = (/** @type {Record<string, unknown>} */ o) =>
    Object.fromEntries(
        Object.entries(o)
            .map(([k, v]) => [k, v + ''])
    );

/**
 * Send login request
 * @param {{ username: string; password: string; loginURLParams: URLSearchParams }} request
 * @return {Promise<{ code: string; message: string }>} the response object
 */
async function sendLoginRequest(
    /** @type {{ username: string; password: string; loginURLParams: URLSearchParams }} */
    {
        username,
        password,
        loginURLParams
    }
) {
    
    const VERSION = 0;
    const PORTAL_PAGE_ID = 1;

    const params = stringifyValue({
        userid: username,
        passwd: password,
        wlanuserip: loginURLParams.get('wlanuserip') || '',
        wlanacname: loginURLParams.get('wlanacname') || '',
        wlanacIp: '',
        ssid: '',
        vlan: loginURLParams.get('vlan') || '',
        mac: encodeURIComponent(loginURLParams.get('mac') || ''),
        version: VERSION,
        portalpageid: PORTAL_PAGE_ID,
        timestamp: Date.now(),
        portaltype: ''
    });

    const requestParams = new URLSearchParams(params);

    const requestUrl = new URL(`${window.location.origin}/quickauth.do?${requestParams}`);

    const res = await fetch(requestUrl.toString(), { credentials: 'same-origin' });

    if (res.ok) {
        return /** @type {{ code: string; message: string }} */ await res.json();
    } else {
        throw new Error(`${res.status}, ${res.statusText}`);
    }
};

export {
    sendLoginRequest as login
}
