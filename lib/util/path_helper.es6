function getColorDir(isColorDrawing) {
  return isColorDrawing ? 'color' : 'no-color';
}

function getRegionDir(isUSA) {
  return isUSA ? 'usa' : 'intl';
}

/**
 *
 */

export function pathForConfigFile() {
  return `${APP_ROOT}/config.json`;
}

export function pathForStateFile() {
  return `${APP_ROOT}/output/run.json`;
}

/**
 *
 */

export function pathForIndexDir({ searchCode }) {
  return `${APP_ROOT}/output/cache/${searchCode}/index-html`;
}

export function pathForRawDetailsDir({ searchCode }) {
  return `${APP_ROOT}/output/cache/${searchCode}/details-html`;
}

export function pathForDetailsDir({ searchCode }) {
  return `${APP_ROOT}/output/cache/${searchCode}/details-json`;
}

export function pathForImageDir({ searchCode }) {
  return `${APP_ROOT}/output/cache/${searchCode}/images-logo`;
}

export function pathForPDFDir({ searchCode, isUSA, isColorDrawing }) {
  const prefix = getColorDir(isColorDrawing);
  const postfix = getRegionDir(isUSA);
  return `${APP_ROOT}/output/${prefix}/${searchCode}/forms-pdf/${postfix}`;
}

export function pathForFormDir({ searchCode, isUSA, isColorDrawing }) {
  const prefix = getColorDir(isColorDrawing);
  const postfix = getRegionDir(isUSA);
  return `${APP_ROOT}/output/${prefix}/${searchCode}/forms-docx/${postfix}`;
}

/**
 *
 */

export function pathForIndexFile({ searchCode, pageIndex }) {
  return `${pathForIndexDir({ searchCode })}/page${pageIndex}.html`;
}

export function pathForRawDetailsFile({ searchCode, serialNumber }) {
  return `${pathForRawDetailsDir({ searchCode })}/${serialNumber}.html`;
}

export function pathForDetailsFile({ searchCode, serialNumber }) {
  return `${pathForDetailsDir({ searchCode })}/${serialNumber}.json`;
}

export function pathForImageFile({ searchCode, serialNumber }) {
  return `${pathForImageDir({ searchCode })}/${serialNumber}-logo`;
}

export function pathForFormFile({ searchCode, regNumber, isUSA, isColorDrawing }) {
  return `${pathForFormDir({ searchCode, isUSA, isColorDrawing })}/${regNumber}.docx`
}

export function pathForTemplateFile({ templateName, isUSA }) {
  if (isUSA) {
    return `${APP_ROOT}/templates/usa.${templateName}`;
  } else {
    return `${APP_ROOT}/templates/intl.${templateName}`;
  }
}

/**
 *
 */

export function pathsForDetails({ searchCode, serialNumber }) {
  return {
    rawDetailsPath: pathForRawDetailsFile({ searchCode, serialNumber }),
    detailsPath: pathForDetailsFile({ searchCode, serialNumber }),
    logoPath: pathForImageFile({ searchCode, serialNumber }),
  }
}
