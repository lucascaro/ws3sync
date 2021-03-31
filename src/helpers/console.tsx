import { Box, Instance, Newline, render, Text } from "ink";
import React, { Dispatch } from "react";
import { ConsoleComponent, logAction, setTaskAction } from "../components/console";
import { ConsoleAction } from "../components/console/reducer";
import { LogLine } from "../components/console/log-line";

export interface Task {
  name: string;
  done: boolean;
}

export interface ConsoleManager {
  log: (message: string) => void;
  info: (message: string) => void;
  ok: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  setTask: (messages: string[], withSpinner?: boolean) => void;
  clearTask: () => void;
}

export function makeConsoleManager(): Promise<Readonly<ConsoleManager>> {
  return new Promise((resolve) => {
    let dispatch: Dispatch<ConsoleAction>;

    render(
      <ConsoleComponent
        onDispatch={(r) => {
          dispatch = r;
          resolve(newConsoleManager(dispatch));
        }}
      />,
    );
  });
}

function newConsoleManager(dispatch: Dispatch<ConsoleAction>): ConsoleManager {
  const logDisplatcher = (color?: string, prefix?: string) => (message: string): void =>
    dispatch(logAction(<LogLine prefixColor={color} prefix={prefix} message={message} />));

  const self: ConsoleManager = {
    clearTask() {
      self.setTask([]);
    },
    setTask(messages, withSpinner = false) {
      dispatch(
        setTaskAction(
          <Box justifyContent="space-between" width="100%">
            {messages.map((message, i) => (
              <Text key={i}>{message}</Text>
            ))}
          </Box>,
          withSpinner,
        ),
      );
    },
    log: logDisplatcher(),
    info: logDisplatcher("blue", "❖"),
    ok: logDisplatcher("green", "✔"),
    error: logDisplatcher("red", "✗"),
    warn: logDisplatcher("yellow", "▴"),
  } as const;
  return Object.freeze(self);
}
