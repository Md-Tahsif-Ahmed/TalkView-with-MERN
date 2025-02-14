import { randomBytes } from 'crypto';

const jwtSecret = randomBytes(32).toString('hex'); // Generates a 64-character hexadecimal string
console.log('Generated JWT Secret:', jwtSecret);
