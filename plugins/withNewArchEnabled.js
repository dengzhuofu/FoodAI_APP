const { withGradleProperties } = require('@expo/config-plugins');

function setGradleProperty(gradleProperties, key, value) {
  const existing = gradleProperties.find((p) => p.type === 'property' && p.key === key);
  if (existing) {
    existing.value = value;
    return gradleProperties;
  }
  return [...gradleProperties, { type: 'property', key, value }];
}

module.exports = function withNewArchEnabled(config) {
  return withGradleProperties(config, (configWithProps) => {
    configWithProps.modResults = setGradleProperty(configWithProps.modResults, 'newArchEnabled', 'false');
    return configWithProps;
  });
};
