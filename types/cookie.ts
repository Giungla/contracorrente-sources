
export const CookieSameSite = ({
  NONE: 'None',
  LAX: 'Lax',
  STRICT: 'Strict',
}) as const

export type ICookieSameSite = typeof CookieSameSite

export interface ICookieOptions {
  path?: string;
  expires?: Date;
  domain?: string;
  secure?: boolean;
  sameSite?: ICookieSameSite[keyof typeof CookieSameSite];
  httpOnly?: boolean;
  maxAge?: number;
}

export interface ISplitCookieObject <T extends string | false = string | false> {
  name: string;
  value: T;
}
