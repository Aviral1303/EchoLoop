/**
 * Shared user state management
 * This module provides a single source of truth for user connection data
 */

let connectedUser = {
  isConnected: false,
  email: '',
  name: '',
  tokens: null,
  connectedAt: null
};

/**
 * Get the current connected user
 */
function getConnectedUser() {
  return connectedUser;
}

/**
 * Set the connected user data
 */
function setConnectedUser(userData) {
  connectedUser = userData;
}

/**
 * Check if user is connected and has valid tokens
 */
function isUserConnected() {
  return connectedUser.isConnected && 
         connectedUser.tokens && 
         new Date(connectedUser.tokens.expires_at) > new Date();
}

/**
 * Disconnect the user
 */
function disconnectUser() {
  connectedUser = {
    isConnected: false,
    email: '',
    name: '',
    tokens: null,
    connectedAt: null
  };
}

module.exports = {
  getConnectedUser,
  setConnectedUser,
  isUserConnected,
  disconnectUser
}; 