import { MongoDbConfig } from '@/config/mongo.config';
import path from 'path';

const mongoConfig = {
  mongodb: {
    url: MongoDbConfig.MONGO_DB_URL || 'mongodb://localhost:27017',

    databaseName: MongoDbConfig.MONGO_DB_NAME,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
    },
  },

  migrationsDir: path.join(__dirname, '../src/db/mongo-migrations'),

  changelogCollectionName: 'changelog',

  migrationFileExtension: '.ts',

  useFileHash: false,

  moduleSystem: 'commonjs',
};

module.exports = mongoConfig;
