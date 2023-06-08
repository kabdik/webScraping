import { get } from 'env-var';

export enum AppEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

const APP_ENVS = Object.values(AppEnv);

export class ServerConfig {
  public static readonly NODE_ENV: AppEnv = get('NODE_ENV').required().asEnum(APP_ENVS);

  public static readonly PORT: number = get('PORT').required().asPortNumber();
}
