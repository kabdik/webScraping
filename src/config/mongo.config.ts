import { get } from 'env-var';

export class MongoDbConfig {
  public static readonly MONGO_DB_URL: string = get('MONGO_DB_URL').required().asString();

  public static readonly MONGO_DB_NAME?: string = get('MONGO_DB_NAME').asString();

  public static readonly MONGO_DB_ENABLE_LOG: boolean = get('MONGO_DB_ENABLE_LOG').default('false').asBool();
}
