const isValidUrl = (text: string): boolean => {
  try {
    new URL(text);
    return true;
  } catch (e) {
    return false;
  }
};

export { isValidUrl };