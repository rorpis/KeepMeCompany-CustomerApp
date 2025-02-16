/**
 * @typedef {Object} Node
 * @property {string} id - Unique identifier for the node
 * @property {Object.<string, string>} title - Title in different languages
 * @property {Object.<string, string>} description - Description in different languages
 * @property {Path[]} paths - Array of paths leading from this node
 * @property {Object.<string, string>} [activationInstructions] - Optional instructions for activation
 */

/**
 * @typedef {Object} Path
 * @property {string} targetNode - ID of the target node
 * @property {Object.<string, string>} instructions - Instructions in different languages
 */

/**
 * @typedef {Object} Template
 * @property {string} id - Unique identifier for the template
 * @property {string} title - Template name
 * @property {string[]} activeNodes - Array of active node IDs
 */ 