/**
 * Return the login page url of a captive portal.
 * @return {Promise<{ hasCaptivePortal: true; url: string } | { hasCaptivePortal: false }>}
 */
async function detect() {
    const PREFIX = 'http://';
    const DETECTION_STATUS_CODE = 204;
    const TARGET_SERVER_NAME = 'MAGI 1.0';
    const captivePortalDetectionURLs =
        chrome.runtime.getManifest().permissions
            ?.filter(str => str.startsWith(PREFIX)); // use http here to let captive portal redirect.

    if (captivePortalDetectionURLs && captivePortalDetectionURLs.length > 0) {
        captivePortalDetectionURLs.forEach((url => console.debug(`Available url: ${url}`)));
        let success = false;
        let loginURL;
        try {
            for (const url of captivePortalDetectionURLs) {
                const resp = await fetch(url, {
                    mode: 'no-cors',
                    redirect: 'follow',
                    keepalive: true,
                });
                if (resp.status == DETECTION_STATUS_CODE) {
                    console.log('logon');
                    break;
                } else {
                    console.log(`it seems that we need login now. url: ${url}, statusCode: ${resp.status}`);
                    if (resp.headers.get('Server') == TARGET_SERVER_NAME) {
                        try {
                            const htmlText = await resp.text();
    
                            const parser = new DOMParser();
                            const dom = parser.parseFromString(htmlText, 'text/html');
                            let matchedString = dom.querySelector('head')
                                ?.querySelector('script')
                                ?.textContent?.trim()
                                .match(/location\.replace\("(.*)&url.*\);/);
                            
                            if (matchedString) {
                                loginURL = matchedString[1];
                                console.log(`got login url: ${loginURL}`);
                                success = true;
                            } else {
                                throw new Error('unable to get loginURL.');
                            }
    
                        } catch (error) {
                            console.error(error);
                        }
                    } else { // no target server, so not in desired portal captive
                        success = true;
                        break;
                    }
                }
                if (success) {
                    break;
                }
            }

        } catch (error) {
            console.error(`${error}`);
        } finally {
            return (
                loginURL ?
                { hasCaptivePortal: true, url: loginURL } :
                { hasCaptivePortal: false }
            );
        }
    } else {
        throw new Error('no available url.')
    }
}

export {
    detect as portalDetection
}
