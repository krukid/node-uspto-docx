export function urlForDetails(serialNumber) {
  return `http://${process.env.DOMAIN}/statusview/sn${serialNumber}`;
}

export function urlForLogo(serialNumber) {
  const cacheBuster = new Date().getTime();
  return `http://${process.env.DOMAIN}/img/${serialNumber}/large?${cacheBuster}`;
}
