import { UserPayload } from '../src/modules/auth/auth.interface';

export declare global {
  type AnyObject = Record<string, unknown>;

  namespace Express {
    interface Request {
      id: string;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends UserPayload {
      userId: number;
    }
  }
}
