export const TriggerTestData = {
  invalidRoles: {
    admin: 'admin',
    empty: '',
    invalid: 'invalid_role',
  },

  metadata: {
    structureFull: {
      avatar_url: 'https://example.com/structure-avatar.jpg',
      first_name: 'Structure',
      last_name: 'Manager',
      preferred_language: 'fr',
    },

    withAllFields: {
      avatar_url: 'https://example.com/avatar.jpg',
      first_name: 'John',
      last_name: 'Doe',
      preferred_language: 'en',
    },

    withEmptyStrings: {
      avatar_url: '',
      first_name: '',
      last_name: '',
    },

    withTrimmedFields: {
      avatar_url: '  https://example.com/avatar.jpg  ',
      first_name: '  Jane  ',
      last_name: '  Smith  ',
    },

    withWhitespace: {
      avatar_url: '  ',
      first_name: '   ',
      last_name: '\t\n',
    },
  },

  validRoles: {
    professional: 'professional',
    structure: 'structure',
  },
};
