/** V5: Retired retention endpoint. Keeps old function URL non-destructive. */
const h={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type,x-att-v3-cron','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json'};
Deno.serve(req=>req.method==='OPTIONS'?new Response(null,{headers:h}):new Response(JSON.stringify({error:'Legacy attendance cleanup disabled in V5. No automatic deletion.'}),{status:410,headers:h}));
