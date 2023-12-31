/**
 * The WebSocket connection to the kernel is invalid. This might
 * mean that it unexpectedly crashed, we are trying to send messages
 * to a kernel that is dead (but has not set its status correctly), etc.
 */
export const EXEC_WEBSOCKET_ERROR = "EXEC_WEBSOCKET_ERROR";
/**
 * An error raised during the execution lifecycle when there is no
 * connected kernel.
 */
export const EXEC_NO_KERNEL_ERROR = "EXEC_NO_KERNEL_ERROR";
/**
 * The cell that requested execution does not have any source code
 * in it.
 */
export const EXEC_NO_SOURCE_ERROR = "EXEC_NO_SOURCE_ERROR";
/**
 * Only code cells can be executed. If the execution request receives
 * a reference to a raw or markdown cell, this code will be thrown.
 */
export const EXEC_INVALID_CELL_TYPE = "EXEC_INVALID_CELL_TYPE";
/**
 * There was no Cell in the notebook with the given CellId for
 * execution. The cell might have been deleted or there may be a
 * mismatch between the ContentRef and CellId passed as properties
 * for execution.
 */
export const EXEC_NO_CELL_WITH_ID = "EXEC_NO_CELL_WITH_ID";
/**
 * The execution request came from a ContentRecord that was not
 * a notebook.
 *
 * Note: in the future, nteract plans to add support for execution
 * from any file type. Until then, our logic assumes that the executing
 * file is a notebook so errors are thrown for that case.
 */
export const EXEC_NOT_A_NOTEBOOK = "EXEC_NOT_A_NOTEBOOK";
/**
 * An error bubbled up while processing the execution lifecycle for
 * an individual cell. This might mean the the kernel connection
 * was interrupted while we were processing messages from the kernel,
 * a malformed payload was received from the kernel, etc.
 */
export const EXEC_ERROR_IN_CELL_STREAM = "EXEC_ERROR_IN_CELL_STREAM";
/**
 * An error occurred while processing the overall execution lifecycle
 * of a notebook. This might mean that the WebSocket connection was disrupted
 * or another unhandled exception occurred in the execution epic.
 *
 * When this error is thrown, the epic will recover but execution requests
 * that were sent in the meantime might fail.
 */
export const EXEC_EPIC_ERROR = "EXEC_EPIC_ERROR";
/** 
 * An error returned by the kernel on cell run as an "error" message type.
 */
export const EXEC_CELL_RUNTIME_ERROR = "EXEC_CELL_RUNTIME_ERROR"
