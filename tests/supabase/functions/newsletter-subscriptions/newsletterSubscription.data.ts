export const NewsletterSubscriptionTestData = {
  edgeCaseLongEmail: {
    email: `${'a'.repeat(200)}@example.com`,
    name: 'Test User',
  },
  edgeCaseLongName: {
    email: 'longname@example.com',
    name: 'A'.repeat(500),
  },
  edgeCaseSpecialCharacters: {
    email: 'test+special@example.com',
    name: "O'Brien & Co.",
  },
  invalidSubscriptionRequestEmptyEmail: {
    email: '',
    name: 'Test User',
  },
  invalidSubscriptionRequestInvalidEmail: {
    email: 'not-an-email',
    name: 'Test User',
  },
  invalidSubscriptionRequestMissingEmail: {
    name: 'Test User',
  },
  validSubscriptionRequest: {
    email: 'test@example.com',
    name: 'Test User',
  },
  validSubscriptionRequestMinimal: {
    email: 'minimal@example.com',
  },
  validSubscriptionRequestWithoutName: {
    email: 'noname@example.com',
    name: null,
  },
};
