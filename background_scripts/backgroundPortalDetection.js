const detectionName = 'shouldDetect';

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name == detectionName) {
        (async function() {
            const { portalDetection } = await import('../portal-detection.js');
            const { getValue, getParamsOf } = await import('../util.js');
            const { login } = await import('../login-request.js');

            const detectResult = await portalDetection();
            if (detectResult.hasCaptivePortal) {
                const params = getParamsOf(detectResult.url);

                const /** @type {Record<string, string>} */ { username, password } = await getValue(['username', 'password']);

                if (username && password) {
                    let responseObject;
    
                    try {
                        responseObject = await login({ username, password, loginURLParams: params });
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

chrome.alarms.create(detectionName, { when: Date.now(), periodInMinutes: 1 });
