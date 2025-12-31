try {
    const iap = require('react-native-iap');
    console.log('--- EXPORTED KEYS ---');
    console.log(Object.keys(iap));
    console.log('--- DEFAULT KEYS ---');
    console.log(iap.default ? Object.keys(iap.default) : 'No Default Export');
} catch (e) {
    console.error('Require Failed:', e.message);
}
