module.exports = {
  server: {
    port: 3000,
    version: 'v1',
  },
  database: {
    uri: 'mongodb://localhost:27017/calories',
    table: '',
  },
  logger: {
    level: '',
  },
  secret: {
    passwordSalt: '$2a$10$lvh1E1ZVePCsuLSN22jI3e',
    jwtSignature: 'devAppSecret',
  },
  nutritionix: {
    key: '1bc56afe2aef0fa1e670a6ad30676936',
    id: '3522a250',
  },
  listing: {
    limit: 10,
  },
};
