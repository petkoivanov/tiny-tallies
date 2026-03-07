import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.toml',
        },
        miniflare: {
          bindings: {
            APP_API_KEY: 'test-api-key',
            APPLE_BUNDLE_ID: 'com.magicmirror.tinytallies',
            GOOGLE_WEB_CLIENT_ID: 'test-google-client-id',
            ENVIRONMENT: 'test',
          },
          d1Databases: ['DB'],
        },
      },
    },
  },
});
