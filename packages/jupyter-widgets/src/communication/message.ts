export const POST_MESSAGE_IDENTIFIER = 'jupter-widgets';

export enum PostMessageType {
  ERROR_MESSAGE = 'error',
  REGULAR_MESSAGE = 'message',
  COMPLETE_MESSAGE = 'complete',
}

/**
 * Format of a post message between the widget iframe and nteract app.
 */
export interface Message<T> {
  id: 'jupter-widgets';
  type: PostMessageType;

  /**
   * Populated for subType 'msg'.
   */
  payload?: T;

  /**
   * Populate for subType 'error'.
   */
  error?: string;
}