import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'CWC',

  projectId: 'smatdclo',
  dataset: 'site',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Work Projects')
              .schemaType('project')
              .child(S.documentTypeList('project').title('Work Projects')),
            S.listItem()
              .title('Photography Series')
              .schemaType('photography')
              .child(S.documentTypeList('photography').title('Photography Series')),
            S.listItem()
              .title('Playground')
              .schemaType('playground')
              .child(S.documentTypeList('playground').title('Playground')),
            S.divider(),
            S.listItem()
              .title('Site Settings')
              .schemaType('settings')
              .child(S.document().schemaType('settings').documentId('settings')),
            S.listItem()
              .title('About / Hero')
              .schemaType('about')
              .child(S.document().schemaType('about').documentId('about')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (input, context) =>
      ['settings', 'about'].includes(context.schemaType)
        ? input.filter(({action}) => !['delete', 'duplicate'].includes(action))
        : input,
  },
})
