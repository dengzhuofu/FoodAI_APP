const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

const withAmap = (config, { android, ios }) => {
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    
    // Remove existing meta-data if any to avoid duplicates
    if (mainApplication['meta-data']) {
      mainApplication['meta-data'] = mainApplication['meta-data'].filter(
        (item) => item.$['android:name'] !== 'com.amap.api.v2.apikey'
      );
    } else {
      mainApplication['meta-data'] = [];
    }

    mainApplication['meta-data'].push({
      $: {
        'android:name': 'com.amap.api.v2.apikey',
        'android:value': android.apiKey,
      },
    });

    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults.AMapApiKey = ios.apiKey;
    return config;
  });

  return config;
};

module.exports = withAmap;
