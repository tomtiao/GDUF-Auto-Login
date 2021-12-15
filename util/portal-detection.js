/**
 * create a promise that resolves after given ms
 * @param {number} timeout 
 * @return {Promise<ReturnType<typeof setTimeout>>}
 */
function createTimeoutPromise(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * Return the login page url of a captive portal.
 * @param {string[]} detectionURLs an array of urls that will send a request to
 * @param {number} detectionSuccessStatusCode the status code in the detection response, default 204
 * @param {number} detectTimeout ms before one request to detection url timeout, default 5000ms
 * @return {Promise<{ hasCaptivePortal: true; url: string } | { hasCaptivePortal: false }>}
 */
async function detect(detectionURLs, detectionSuccessStatusCode = 204, detectTimeout = 5000) {
    const DETECTION_STATUS_CODE = detectionSuccessStatusCode;
    const TARGET_SERVER_NAME = 'MAGI 1.0';
    detectionURLs.forEach((url => console.debug(`Available url: ${url}`)));
    let success = false;
    let loginURL;
    try {
        for (const url of detectionURLs) {
            let resp;

            {
                const timeout = createTimeoutPromise(detectTimeout);
                const detection = fetch(url, {
                    mode: 'no-cors',
                    redirect: 'follow',
                });
                resp = await Promise.race([detection, timeout]);
            }

            if (resp instanceof Response) {
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
                    } else { // no target server, so we are not in the expected portal captive
                        success = true;
                        break;
                    }
                }
                if (success) {
                    break;
                }
            } else {
                console.log(`request to ${url} timeout.`);
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
}

export {
    detect as detectPortal
}
