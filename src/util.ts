export function getEndpoint(mode: 'upload' | 'get' | 'post', q: any) {
    const envRaw = localStorage.getItem('env')
    if (!envRaw) return ''
    const env = JSON.parse(envRaw)
    let s = `auth=${env.auth}`
    for (const [key, value] of Object.entries(q)) {
        s = s + `&${key}=${value}`
    }
    return `${env[mode]}?${s}`
}
export function getCDN() {
    const envRaw = localStorage.getItem('env')
    if (!envRaw) return ''
    const env = JSON.parse(envRaw)
    return `${env.cdn}`
}