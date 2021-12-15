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

function setDetectionAlarm(/** @type {boolean} */ shouldLoginInBackground) {
    chrome.storage.sync.get('username', (items) => {
        const { username } = items;
        
        if (username == defaultUsername || username == '') return;

        if (shouldLoginInBackground) {
            chrome.alarms.get(detectionAlarmName, (alarm) => {
                if (alarm) chrome.alarms.clear(detectionAlarmName); // alarm exists, so clear the alarm
                
                chrome.alarms.create(detectionAlarmName, { when: Date.now(), periodInMinutes: 1 });
            });
        } else {
            chrome.alarms.clear(detectionAlarmName);
        }
    });
}

chrome.storage.onChanged.addListener(function handleBackgroundAutoLoginChanges(changes) {
    if ('backgroundAutoLogin' in changes) {
        const { newValue: shouldLoginInBackground } = changes.backgroundAutoLogin;
        setDetectionAlarm(shouldLoginInBackground);
    }
});

const initialDetection = () => {
    chrome.storage.sync.get('backgroundAutoLogin', (items) => {
        if (!('backgroundAutoLogin' in items)) return; // backgroundAutoLogin is not set. should wait till next time
    
        const /** @type {boolean} */ shouldLoginInBackground = items.backgroundAutoLogin;
        setDetectionAlarm(shouldLoginInBackground);
    });
};

initialDetection();

chrome.runtime.onMessage.addListener(message => {
    if (message.setDetectionNow) {
        initialDetection();
    }
});
