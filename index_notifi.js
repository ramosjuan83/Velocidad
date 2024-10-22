

const notifier = require('node-notifier');

// String
notifier.notify('¡advertencia de operar!');
// Object
notifier.notify({
  'title': 'Imaginanet Blog',
  'subtitle': 'Verificacion '+ porc,
  'message': 'Mayor a 100 usdt',
  'icon': 'imaginanet-logo.png',
  'contentImage': 'blog.png',
  'sound': 'pito.mp3',
  'wait': true
});
