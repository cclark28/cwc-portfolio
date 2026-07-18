export default {
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'siteTitle', title: 'Site Title', type: 'string' },
    { name: 'contactEmail', title: 'Contact Email', type: 'string', validation: Rule => Rule.required().email() },
    { name: 'passwordEnabled', title: 'Password Gate Enabled', type: 'boolean', initialValue: false },
    { name: 'sitePassword', title: 'Site Password', type: 'string', description: 'The single password that unlocks all private projects and photos.' },

    // Command module / Terminal settings
    {
      name: 'commandModule',
      title: 'Command Module',
      type: 'object',
      description: 'Controls for the command bar at the bottom of the canvas.',
      fields: [
        { name: 'showWork', title: 'Show "work" command', type: 'boolean', initialValue: true },
        { name: 'workLabel', title: 'Work label', type: 'string', description: 'Custom label for the work button (default: "work")' },
        { name: 'showPhoto', title: 'Show "photo" command', type: 'boolean', initialValue: true },
        { name: 'photoLabel', title: 'Photo label', type: 'string', description: 'Custom label for the photo button (default: "photo")' },
        { name: 'showPlayground', title: 'Show "playground" command', type: 'boolean', initialValue: true },
        { name: 'playgroundLabel', title: 'Playground label', type: 'string', description: 'Custom label for the playground button (default: "playground")' },
        { name: 'showInfo', title: 'Show "info" command', type: 'boolean', initialValue: true },
        { name: 'showHelp', title: 'Show "help" command', type: 'boolean', initialValue: true },
        { name: 'showEsc', title: 'Show "esc" command', type: 'boolean', initialValue: true },
        { name: 'placeholder', title: 'Input placeholder text', type: 'string', description: 'Placeholder shown in the command input (default: "type a command — work, photo, info…")' },
        { name: 'hint', title: 'Hint text', type: 'string', description: 'Small hint text on the right side (default: "scroll to zoom")' },
      ],
    },
  ],
}
