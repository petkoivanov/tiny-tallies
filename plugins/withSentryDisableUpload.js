const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Config plugin that disables Sentry source map uploads.
 * Uses afterEvaluate to disable SentryUpload tasks after all plugins
 * have registered their tasks, so no Sentry auth token is required.
 */
function withSentryDisableUpload(config) {
  return withAppBuildGradle(config, (config) => {
    const snippet = `
// Disable Sentry source map uploads (no auth token required)
afterEvaluate {
    tasks.matching { it.name.contains("SentryUpload") }.configureEach {
        enabled = false
    }
}
`;

    if (!config.modResults.contents.includes('SentryUpload')) {
      config.modResults.contents += snippet;
    }

    return config;
  });
}

module.exports = withSentryDisableUpload;
