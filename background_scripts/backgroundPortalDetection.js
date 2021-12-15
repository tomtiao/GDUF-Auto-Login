const detectionAlarmName = 'shouldDetect';
const detectionURLs = chrome.runtime.getManifest().
    permissions?.filter(str => str.startsWith('http://')); // use http here to let captive portal redirect.

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name == detectionAlarmName) {
        (async function() {
            const { detectPortal } = await import('../util/portal-detection.js');
            const { getValue } = await import('../util.js');
            const { login } = await import('../util/login-request.js');

            if (!detectionURLs) throw new Error('no available detection url.');
            
            const detectResult = await detectPortal(detectionURLs);
            if (detectResult.hasCaptivePortal) {
                const redirectURL = new URL(detectResult.url);

                const /** @type {Record<string, string>} */ { username, password } = await getValue(['username', 'password']);

                if (username && password) {
                    
                    let responseObject;
                    try {
                        responseObject = await login({ username, password, loginURL: redirectURL });

                        if ( +responseObject.code !== 0 ) {
                            console.error(responseObject);
                        }
                    } catch (error) {
                        if (error instanceof TypeError) {
                            console.error(`NetworkError when sending request: ${error}`);
                        } else {
                            console.error(`Encountered error when sending request: ${error}`);
                        }
                    }
                }
            } else {
                console.log('no captive portal');
            }
        })();
    }
});

chrome.storage.onChanged.addListener(function handleBackgroundAutoLoginChanges(changes, areaName) {
    if ('backgroundAutoLogin' in changes) {
        const { newValue: shouldLoginInBackground } = changes.backgroundAutoLogin;
        if (shouldLoginInBackground) {
            chrome.alarms.get(detectionAlarmName, (alarm) => {
                if (alarm) return; // alarm exists, no need to create alarm
                
                chrome.alarms.create(detectionAlarmName, { when: Date.now(), periodInMinutes: 1 });
            });
        } else {
            chrome.alarms.clear(detectionAlarmName);
        }
    }
});

function initialBackgroundLogin() {
    chrome.storage.sync.get('backgroundAutoLogin', (items) => {
        if ('backgroundAutoLogin' in items) {
            const /** @type {boolean} */ shouldLoginInBackground = items.backgroundAutoLogin;
            if (shouldLoginInBackground) {
                chrome.alarms.create(detectionAlarmName, { when: Date.now(), periodInMinutes: 1 });
            }
        } else {
            console.error(`no backgroundAutoLogin! items: ${JSON.stringify(items)}`);
        }
    });
}
