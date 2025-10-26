import { type ClassValue } from 'clsx';
import { type MouseEvent, type KeyboardEvent } from 'react';

export type MaybePromise<T> = T | Promise<T>;

export type WithClassName<T = unknown> = T & {
  className?: string;
};

export type WithChildren<T = unknown> = T & {
  children: React.ReactNode;
};

export type ButtonEvent = MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>;

export type ClassName = ClassValue[];

export type Theme = 'dark' | 'light' | 'system';

export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export type ErrorWithMessage = {
  message: string;
  [key: string]: any;
};