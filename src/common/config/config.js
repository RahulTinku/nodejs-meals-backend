module.exports = {
  server: {
    port: 3000,
    version: 'v1',
    status: 'test', // test || live
    host: '',
  },
  database: {
    uri: '',
  },
  logger: {
    level: '',
  },
  secret: {
    passwordSalt: '',
    jwtSignature: '',
  },
  nutritionix: {
    key: '',
    id: '',
  },
  listing: {
    limit: 10,
  },
  mail: {
    sendgrid: {
      apiKey: '',
      templates: {
        newUser: {
          subject: 'Verify your account',
          templateId: '',
        },
        activeNewUser: {
          subject: 'New account details',
          templateId: '',
        },
        forgotPassword: {
          subject: 'Password Reset',
          templateId: '',
        },
        resetPassword: {
          subject: 'New Password',
          templateId: '',
        },
      },
    },
    fromEmail: '',
  },
};
