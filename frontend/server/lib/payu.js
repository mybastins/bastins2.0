const crypto = require('crypto');

const PAYU_ACTION_URL = process.env.PAYU_MODE === 'live'
  ? 'https://secure.payu.in/_payment'
  : 'https://test.payu.in/_payment';

function sha512(str) {
  return crypto.createHash('sha512').update(str).digest('hex');
}

/* PayU request hash: key|txnid|amount|productinfo|firstname|email|udf1..udf10|SALT
   udf1-10 are unused here, so all ten are empty strings. */
function buildPayuHash({ key, txnid, amount, productinfo, firstname, email, salt }) {
  const udfs = new Array(10).fill('');
  const parts = [key, txnid, amount, productinfo, firstname, email, ...udfs, salt];
  return sha512(parts.join('|'));
}

/* PayU response (reverse) hash: SALT|status|udf10..udf6|udf5..udf1|email|firstname|productinfo|amount|txnid|key
   Returns whether the hash PayU sent back matches what we independently compute. */
function verifyPayuResponseHash(fields) {
  const { key, txnid, amount, productinfo, firstname, email, status, salt, hash } = fields;
  if (!hash || !salt || !key) return false;
  const udf1to5 = [fields.udf1, fields.udf2, fields.udf3, fields.udf4, fields.udf5].map(v => v || '');
  const udf6to10 = new Array(5).fill('');
  const parts = [
    salt, status,
    ...udf6to10,
    ...udf1to5.slice().reverse(),
    email, firstname, productinfo, amount, txnid, key
  ];
  const expected = sha512(parts.join('|'));
  return expected === hash;
}

module.exports = { buildPayuHash, verifyPayuResponseHash, PAYU_ACTION_URL };
