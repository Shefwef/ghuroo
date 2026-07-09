// Escapes RegExp metacharacters in user-supplied text before it is interpolated
// into a MongoDB $regex query. Without this, characters like ( ) [ ] . * + ? ^ $ |
// either throw "Invalid regular expression" (malformed pattern) or change the
// meaning of the search (regex injection / ReDoS surface). See
// maintenance/01-corrective-maintenance.md for the defect writeup.
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
