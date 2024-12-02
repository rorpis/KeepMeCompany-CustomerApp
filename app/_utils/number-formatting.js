/**
 * Formats a number with thousands separators
 * @param {number|string} num - Number to format
 * @param {string} separator - Separator to use (defaults to ',')
 * @returns {string} Formatted number
 */
export const formatNumber = (num, separator = ',') => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };
  
  /**
   * Parses a formatted number back to raw value
   * @param {string} str - Formatted number string
   * @param {string} separator - Separator used (defaults to ',')
   * @returns {string} Raw number string
   */
  export const parseFormattedNumber = (str, separator = ',') => {
    if (!str) return '';
    return str.replace(new RegExp(separator, 'g'), '');
  };
  
  /**
   * Formats milliseconds into a time string
   * @param {number} milliseconds - Time in milliseconds
   * @param {Object} options - Formatting options
   * @param {boolean} options.showMs - Whether to show milliseconds (default: true)
   * @param {string} options.separator - Separator between minutes and seconds (default: ':')
   * @returns {string} Formatted time string
   */
  export const formatTime = (milliseconds, options = {}) => {
    const { showMs = true, separator = ':' } = options;
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 100);

    const timeString = `${minutes}${separator}${remainingSeconds.toString().padStart(2, '0')}`;
    return showMs ? `${timeString}.${ms}` : timeString;
  };