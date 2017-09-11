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
  return `${APP_ROOT}/output/${searchCode}/index-html`;
}

export function pathForRawDetailsDir({ searchCode }) {
  return `${APP_ROOT}/output/${searchCode}/details-html`;
}

export function pathForDetailsDir({ searchCode }) {
  return `${APP_ROOT}/output/${searchCode}/details-json`;
}

export function pathForImageDir({ searchCode }) {
  return `${APP_ROOT}/output/${searchCode}/images-logo`;
}

export function pathForPDFDir({ searchCode, isUSA }) {
  if (isUSA) {
    return `${APP_ROOT}/output/${searchCode}/forms-pdf/usa`;
  } else {
    return `${APP_ROOT}/output/${searchCode}/forms-pdf/intl`;
  }
}

export function pathForFormDir({ searchCode, isUSA }) {
  if (isUSA) {
    return `${APP_ROOT}/output/${searchCode}/forms-docx/usa`;
  } else {
    return `${APP_ROOT}/output/${searchCode}/forms-docx/intl`;
  }
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

export function pathForFormFile({ searchCode, regNumber, isUSA }) {
  return `${pathForFormDir({ searchCode, isUSA })}/${regNumber}.docx`
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
    // formPathUSA: pathForFormFile({ searchCode, serialNumber, isUSA: true }),
    // formPathINTL: pathForFormFile({ searchCode, serialNumber, isUSA: false }),
  }
}
