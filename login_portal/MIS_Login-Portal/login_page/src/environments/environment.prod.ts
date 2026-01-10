export const environment = {
    production: true,
    apiUrl: '/api',  // Uses relative path for production (proxied via nginx)
    serviceId: 1,    // Production service ID - update to match registered service
    serviceApiKey: 'REPLACE_WITH_PRODUCTION_KEY',  // Set via environment variable in deployment
    qrCodeExpirySeconds: 300
};
