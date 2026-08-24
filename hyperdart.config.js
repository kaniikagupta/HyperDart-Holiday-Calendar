import pkg from './package.json' with { type: 'json' }

export default {
  name: pkg.name,

  triggers: {
    keywords: [
      'holiday',
      'holidays',
      'public holiday',
      'public holidays',
      'bank holiday',
      'bank holidays',
      'holiday calendar'
    ]
  },

  query_format: {
    regex: [
      '.*(holiday|holidays|public holiday|public holidays|bank holiday|bank holidays).*'
    ]
  },

  server: {
    location: 'dist/backend/index.js',
    configPath: 'dist/backend/wrangler.jsonc',
    schemaPath: 'dist/backend/schema.jsonc'
  },

  client: {
    location: pkg.module,
    moduleName: pkg.umdName || 'HD' + pkg.name,
    baseURL: '/' + pkg.name
  },

  format: {
    mainline: true,
    sidebar: true
  },

  permissions: {},

  info: {
    description: 'Public holiday calendar for countries around the world'
  }
}