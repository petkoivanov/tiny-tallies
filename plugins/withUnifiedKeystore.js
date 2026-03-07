const { withAppBuildGradle } = require('@expo/config-plugins');
const path = require('path');

/**
 * Config plugin that uses a single keystore for both debug and release builds.
 * Keystore lives in /keystores/ (outside android/) so it persists across prebuild --clean.
 */
function withUnifiedKeystore(config, props = {}) {
  const {
    keystorePath = '../../keystores/tinytallies.keystore',
    keystorePassword = 'tinytallies',
    keyAlias = 'tinytallies',
    keyPassword = 'tinytallies',
  } = props;

  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // Replace the signingConfigs block to use our keystore for both debug and release
    const signingConfigsReplacement = `signingConfigs {
        debug {
            storeFile file("${keystorePath}")
            storePassword "${keystorePassword}"
            keyAlias "${keyAlias}"
            keyPassword "${keyPassword}"
        }
        release {
            storeFile file("${keystorePath}")
            storePassword "${keystorePassword}"
            keyAlias "${keyAlias}"
            keyPassword "${keyPassword}"
        }
    }`;

    // Replace existing signingConfigs block
    contents = contents.replace(
      /signingConfigs\s*\{[\s\S]*?\n    \}/,
      signingConfigsReplacement
    );

    // Ensure release buildType uses signingConfigs.release
    contents = contents.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release'
    );

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withUnifiedKeystore;
