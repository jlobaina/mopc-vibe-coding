/**
 * Utility functions for handling user names and initials
 * Safely handles cases where name properties might be undefined
 */

export type User = {
  firstName?: string;
  lastName?: string;
  name?: string;
};

/**
 * Gets user initials with proper fallbacks for missing name properties
 */
export function getUserInitials(user?: User): string {
  if (!user) return 'UU';

  // Try firstName + lastName first
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`;
  }

  // Fallback to name if available
  if (user.name) {
    const names = user.name.split(' ').filter(n => n.length > 0);
    if (names.length >= 2 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`;
    } else if (names.length === 1 && names[0]) {
      return names[0][0];
    }
  }

  // If only firstName is available
  if (user.firstName && user.firstName.length > 0) {
    return user.firstName[0];
  }

  // If only lastName is available
  if (user.lastName && user.lastName.length > 0) {
    return user.lastName[0];
  }

  // Ultimate fallback
  return 'UU';
}

/**
 * Gets user display name with proper fallbacks for missing name properties
 */
export function getUserName(user?: User): string {
  if (!user) return 'Usuario desconocido';

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.name) {
    return user.name;
  }

  return 'Usuario desconocido';
}