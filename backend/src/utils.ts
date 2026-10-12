import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const h =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

// Progress is stored per language pair, e.g. "ta>en" (Tamil -> English)
export const pairOf = (u: { source_lang: string | null; target_lang: string | null }) => `${u.source_lang}>${u.target_lang}`;
