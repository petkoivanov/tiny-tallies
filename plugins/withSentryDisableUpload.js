const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Config plugin that disables Sentry source map uploads.
 * Adds upload_sources=false to android/sentry.properties so release
 * builds don't fail without a Sentry auth token.
 */
function withSentryDisableUpload(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const sentryPropsPath = path.join(
        config.modRequest.platformProjectRoot,
        'sentry.properties',
      );

      if (fs.existsSync(sentryPropsPath)) {
        let contents = fs.readFileSync(sentryPropsPath, 'utf8');
        if (!contents.includes('upload_sources=')) {
          contents += '\nupload_sources=false\n';
          fs.writeFileSync(sentryPropsPath, contents);
        }
      }

      return config;
    },
  ]);
}

module.exports = withSentryDisableUpload;
