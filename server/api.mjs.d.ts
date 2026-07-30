export function handleApi(
  method: string,
  pathname: string,
  body: unknown,
): { status: number; body: unknown } | null

export function sendJson(res: unknown, status: number, body: unknown): void

export function handleNodeRequest(
  req: unknown,
  res: unknown,
): Promise<boolean>
