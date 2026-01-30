const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

const withAmapAndroid = (config, apiKey) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Add meta-data
    mainApplication['meta-data'] = mainApplication['meta-data'] || [];
    
    // Remove existing if any
    mainApplication['meta-data'] = mainApplication['meta-data'].filter(
      (item) => item.$['android:name'] !== 'com.amap.api.v2.apikey'
    );

    // Add new key
    mainApplication['meta-data'].push({
      $: {
        'android:name': 'com.amap.api.v2.apikey',
        'android:value': apiKey,
      },
    });

    return config;
  });
};

const withAmapIos = (config, apiKey) => {
  return withInfoPlist(config, (config) => {
    config.modResults.AMapApiKey = apiKey;
    return config;
  });
};

const withAmap = (config, { android, ios }) => {
  if (android && android.apiKey) {
    config = withAmapAndroid(config, android.apiKey);
  }
  if (ios && ios.apiKey) {
    config = withAmapIos(config, ios.apiKey);
  }
  return config;
};

module.exports = withAmap;
