export interface ConsoleManagerState {
  log: React.ReactElement[];
  currentTask?: React.ReactElement;
  showSpinner?: boolean;
}

export enum ConsoleActionType {
  LOG,
  SET_TASK,
}

export type ConsoleAction = ConsoleLogAction | ConsoleSetTaskAction;

export interface ConsoleLogAction {
  type: ConsoleActionType.LOG;
  message: React.ReactElement;
}
export interface ConsoleSetTaskAction {
  type: ConsoleActionType.SET_TASK;
  message: React.ReactElement;
  withSpinner?: boolean;
}

export type ConsoleReducer = (state: ConsoleManagerState, action: ConsoleAction) => ConsoleManagerState;

export const reducer: ConsoleReducer = (state, action) => {
  const log = [];
  switch (action.type) {
    case ConsoleActionType.LOG:
      // Use sparse arrays for the log, anticipating large numbers of logs.
      log[state.log.length] = action.message;
      return { ...state, log };
    case ConsoleActionType.SET_TASK:
      return { ...state, currentTask: action.message, showSpinner: action.withSpinner };
    default:
      // Exhaustive check.
      const _: never = action;
      throw new Error(`Unknown action type: ${action}`);
  }
};

export const logAction = (message: React.ReactElement): ConsoleLogAction => ({
  type: ConsoleActionType.LOG,
  message,
});

export const setTaskAction = (message: React.ReactElement, withSpinner?: boolean): ConsoleSetTaskAction => ({
  type: ConsoleActionType.SET_TASK,
  message,
  withSpinner,
});
