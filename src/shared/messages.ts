export enum MessageType {
  CONTENT_READY = 'content:ready',
  SCREENSHOT_TRIGGER = 'screenshot:trigger',
  SCREENSHOT_REQUEST = 'screenshot:request',
  SCREENSHOT_RESULT = 'screenshot:result',
  SCREENSHOT_ERROR = 'screenshot:error',
}

export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenshotRequestMessage {
  type: MessageType.SCREENSHOT_REQUEST;
  payload: {
    bounds: SelectionBounds;
    viewport: {
      width: number;
      height: number;
    };
    devicePixelRatio: number;
  };
}

export interface ContentReadyMessage {
  type: MessageType.CONTENT_READY;
}

export interface ScreenshotSuccessMessage {
  type: MessageType.SCREENSHOT_RESULT;
  payload: {
    dataUrl: string;
  };
}

export interface ScreenshotErrorMessage {
  type: MessageType.SCREENSHOT_ERROR;
  payload: {
    error: string;
  };
}

export interface ScreenshotTriggerMessage {
  type: MessageType.SCREENSHOT_TRIGGER;
}

export type OutgoingContentMessage = ContentReadyMessage | ScreenshotRequestMessage;
export type IncomingContentMessage =
  | ScreenshotSuccessMessage
  | ScreenshotErrorMessage
  | ScreenshotTriggerMessage;
