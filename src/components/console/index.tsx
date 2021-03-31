import { Box, Static, Text } from "ink";
import React, { Dispatch, useReducer } from "react";
import Spinner from "ink-spinner";
import { ConsoleAction, ConsoleManagerState, reducer } from "./reducer";

export { ConsoleLogAction, logAction, setTaskAction } from "./reducer";

const initialState: ConsoleManagerState = {
  log: [],
};

export interface ConsoleProps {
  onDispatch: (reducer: Dispatch<ConsoleAction>) => void;
}

export const ConsoleComponent: React.FC<ConsoleProps> = ({ onDispatch }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  onDispatch(dispatch);
  return (
    <>
      <Static items={state.log}>{(line, i) => <Text key={i}>{line}</Text>}</Static>
      {state.currentTask && (
        <Box>
          {state.showSpinner && (
            <Box marginRight={1}>
              <Spinner />
            </Box>
          )}
          {state.currentTask && <Box>{state.currentTask}</Box>}
        </Box>
      )}
    </>
  );
};
