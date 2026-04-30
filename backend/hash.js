const bcrypt = require('bcryptjs');

const password = 'Aro_2026';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Hashed password:', hash);
});