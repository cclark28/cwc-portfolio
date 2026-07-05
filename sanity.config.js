import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'CWC',

  projectId: 'smatdclo',
  dataset: 'site',

  plugins: [structureTool(), visionTool()],

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
