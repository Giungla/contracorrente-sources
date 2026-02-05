
export const HttpMethod = ({
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  HEAD: 'HEAD',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
}) as const

export type HttpMethod = typeof HttpMethod

export type HttpMethods = HttpMethod[keyof typeof HttpMethod]
