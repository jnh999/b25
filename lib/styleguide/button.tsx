"use client";

import {
  Button as RawButton,
  ButtonProps as RawButtonProps,
} from "@/components/ui/button";

import "./styles.css";

interface ButtonProps extends RawButtonProps {
  label: string;
}

export const Button = ({ label, ...rest }: ButtonProps) => {
  return <RawButton aria-label={label} {...rest} />;
};
