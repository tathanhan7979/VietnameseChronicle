/**
 * A simple wrapper for custom Quill image handling
 * This avoids the 'd is not a constructor' error by not using complex modules
 */

export const setupQuillImageResize = (Quill: any): void => {
  // This is intentionally a no-op implementation for now
  // We'll use the built-in image handling in Quill instead of custom resize
  console.log('Image resize not implemented - using built-in Quill image handling');
};