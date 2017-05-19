import Fs from 'fs';
import Cheerio from 'cheerio';
import { pathForRawDetailsFile } from './util/path_helper';

/**
 *
 */

const FIELDS = {
  ownerName: {
    key: 'Owner Name',
  },
  ownerAddress: {
    key: 'Owner Address',
    type: 'paragraph',
  },
  tradeMark: {
    key: 'Mark',
  },
  regNumber: {
    key: 'US Registration Number',
  },
  intClasses: {
    key: 'International Class(es)',
    type: 'class-list',
  },
  markType: {
    key: 'Mark Type',
    type: 'list',
  },
  register: {
    key: 'Register',
    type: 'list',
  },
  filingDate: {
    key: 'Application Filing Date',
  },
  regDate: {
    key: 'Registration Date',
  },
  serialNumber: {
    key: 'US Serial Number',
  },
};

/**
 *
 */

function getFieldMeta(fieldName) {
  return FIELDS[fieldName];
}

function findFieldName(key) {
  return Object.keys(FIELDS).find(fieldName => FIELDS[fieldName].key === key);
}

/**
 *
 */

function extractKey($key) {
  return $key.text().trim().replace(/:$/, '');
}

function extractValue($value, {type}) {
  switch (type) {
    case 'paragraph':
      return $value.children('div').toArray().map(divNode =>
        Cheerio(divNode).text().replace(/\s+/g, ' ').trim());
    case 'list':
      return $value.text().replace(/\s+/g, ' ').split(',').map(item => item.trim());
    case 'class-list':
      return $value.text().replace(/[^\d,]/g, '').split(',');
    default:
      return $value.text().trim();
  }
}

/**
 *
 */

function debugPairs(pairs) {
  Object.keys(pairs).forEach(fieldName => {
    const meta = getFieldMeta(fieldName);
    if (meta) {
      console.log(`<${fieldName}:${meta.type || 'line'}="${meta.key}">`);
    } else {
      console.log(`<${fieldName}:virtual>`);
    }
    console.log(pairs[fieldName]);
    console.log('-----------------');
  });
}

/**
 *
 */

function extractPairs(pairs, $body) {
  const $keys = $body('.table .key');
  $keys.toArray().forEach(keyNode => {
    const $key = $body(keyNode);
    const key = extractKey($key);
    const fieldName = findFieldName(key);
    if (fieldName) {
      const $value = $key.next('.value');
      const meta = getFieldMeta(fieldName);
      const value = extractValue($value, meta);
      pairs[fieldName] = value;
    }
  });
  return pairs;
}

function setOwnerAddress(pairs, $body, paths) {
  if (pairs.ownerAddress) {
    pairs.ownerAddress = pairs.ownerAddress.map(line => {
      const newLine = line.replace(/\bUNITED STATES /, '');
      pairs.isUSA = newLine !== line;
      return newLine;
    });
  }
}

function setLogoPath(pairs, $body, paths) {
  if ($body('#markImage') && pairs.serialNumber) {
    pairs.logoPath = paths.logoPath;
  }
}

function setFormPath(pairs, $body, paths) {
  if (pairs.isUSA) {
    pairs.formPath = paths.formPathUSA;
  } else {
    pairs.formPath = paths.formPathINTL;
  }
}

 /**
  *
  */

export default function detailsScrapeSync(serialNumber, detailsBody, paths) {
  const $body = Cheerio.load(detailsBody);
  const pairs = extractPairs({}, $body);
  setOwnerAddress(pairs, $body, paths);
  // setDateInLocation(pairs, $body, paths);
  setLogoPath(pairs, $body, paths);
  setFormPath(pairs, $body, paths);
  debugPairs(pairs); // @debug
  return pairs;
}
