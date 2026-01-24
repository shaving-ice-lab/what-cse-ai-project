"use client";

export function Toaster() {
  return <div id="toaster" />;
}

export const toast = {
  success: (message: string) => {
    console.log("Toast Success:", message);
    // TODO: Implement actual toast notification
  },
  error: (message: string) => {
    console.log("Toast Error:", message);
    // TODO: Implement actual toast notification
  },
  info: (message: string) => {
    console.log("Toast Info:", message);
    // TODO: Implement actual toast notification
  },
};
