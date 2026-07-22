export default {
    async fetch(request, env)
    {
        const response = await env.ASSETS.fetch(request)

        if(response.status !== 404 || !['GET', 'HEAD'].includes(request.method))
            return response

        const url = new URL(request.url)
        const fallbackRequest = new Request(new URL('/index.html', url), request)
        return env.ASSETS.fetch(fallbackRequest)
    }
}
