export default async (): Promise<Response> => {
  return new Response(
    JSON.stringify({ status: 'ok', platform: 'netlify', timestamp: Date.now() }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }
  );
};
