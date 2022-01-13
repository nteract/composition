//
// Action Types
//
export const BINDER_MENU = "BINDER_MENU"
export const CONSOLE = "CONSOLE" 
export const SAVE_DIALOG = "SAVE_DIALOG" 

export const FILE_PATH = "FILE_PATH"
export const FILE_CONTENT = "ILE_PATH"
export const PROVIDER = "PROVIDER"
export const ORG = "ORG"
export const REPO = "REPO"
export const GIT_REF = "GIT_REF"

export const LANG = "LANG"

export const COMMIT_MESSAGE = "COMMIT_MESSAGE"

export const STRIP_OUTPUT = "STRIP_OUTPUT"
export const FILE_BUFFER = "FILE_BUFFER"
export const SAVED_TIME = "SAVED_TIME"

export const CONSOLE_LOG = "CONSOLE_LOG"
export const NOTIFICATION_LOG = "NOTIFICATION_LOG"

export const SERVER_STATUS = "SERVER_STATUS"
export const HOST = "HOST"

export const LOGGED_IN = "LOGGED_IN"
export const USERNAME = "USERNAME"
export const USER_IMAGE = "IMAGE"
export const USER_LINK = "LINK"

//
// ACTION CREATOR
//


export const toggleBinderMenu = () => ({
  type: `TOGGLE_${BINDER_MENU}`
})

export const toggleConsole = () => ({
  type: `TOGGLE_${CONSOLE}`
})

export const toggleSaveDialog = () => ({
  type: `TOGGLE_${SAVE_DIALOG}`
})

export const setFilePath = (text: string) => ({
  type: `UPDATE_${FILE_PATH}`,
  value: text
})

export const setFileContent = (text: string) => ({
  type: `UPDATE_${FILE_CONTENT}`,
  value: text
})

export const setProvider = (text: string) => ({
  type: `UPDATE_${PROVIDER}`,
  value: text
})

export const setORG = (text: string) => ({
  type: `UPDATE_${ORG}`,
  value: text
})

export const setRepo = (text: string) => ({
  type: `UPDATE_${REPO}`,
  value: text
})

export const setGitRef = (text: string) => ({
  type: `UPDATE_${GIT_REF}`,
  value: text
})

export const setLang = (text: string) => ({
  type: `UPDATE_${LANG}`,
  value: text
})

export const setCommitMessage = (text: string) => ({
  type: `UPDATE_${COMMIT_MESSAGE}`,
  value: text
})

export const toggleStripOutput = () => ({
  type: `TOGGLE_${STRIP_OUTPUT}`
})

export const resetFileBuffer = () => ({
  type: `RESET_${FILE_BUFFER}`
})

export const updateFileBuffer = (content: string, file: string) => ({
  type: `UPDATE_${FILE_BUFFER}`,
  fileName: file,
  value: content
})


export const setSavedTime = (obj: object) => ({
  type: `set_${SAVED_TIME}`,
  value: obj
})

export const appendConsoleLog = (obj: object) => ({
  type: `APPEND_${CONSOLE_LOG}`,
  value: obj
})

export const shiftNotificationLog = () => ({
  type: `SHIFT_${NOTIFICATION_LOG}`,
})

export const appendNotificationLog = (obj: object) => ({
  type: `APPEND_${NOTIFICATION_LOG}`,
  value: obj
})

export const setServerStatus = (text: string) => ({
  type: `UPDATE_${SERVER_STATUS}`,
  value: text
})

export const setHost = (obj: object) => ({
  type: `SET_${HOST}`,
  value: obj
})

export const updateLoggedIn = (flag: boolean) => ({
  type: `UPDATE_${LOGGED_IN}`,
  value: flag
})

export const updateUsername = (text: string) => ({
  type: `UPDATE_${USERNAME}`,
  value: text
})

export const updateUserImage = (text: string) => ({
  type: `UPDATE_${USER_IMAGE}`,
  value: text
})

export const updateUserLink = (text: string) => ({
  type: `UPDATE_${USER_LINK}`,
  value: text
})




