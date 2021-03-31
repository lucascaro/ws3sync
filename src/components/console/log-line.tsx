import React from "react";
import { Text } from "ink";

interface Props {
  prefix?: string;
  prefixColor?: string;
  color?: string;
  message: string;
}

export const LogLine: React.FC<Props> = ({ message, color, prefixColor, prefix }) => {
  return (
    <Text color={color}>
      {prefix && <Text color={prefixColor}>{prefix} </Text>}
      {message}
    </Text>
  );
};
