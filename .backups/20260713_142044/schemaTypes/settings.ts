export default {
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'siteTitle', title: 'Site Title', type: 'string' },
    { name: 'contactEmail', title: 'Contact Email', type: 'string', validation: Rule => Rule.required().email() },
    { name: 'passwordEnabled', title: 'Password Gate Enabled', type: 'boolean', initialValue: false },
    { name: 'sitePassword', title: 'Site Password', type: 'string', description: 'The single password that unlocks all private projects and photos.' },
  ],
}