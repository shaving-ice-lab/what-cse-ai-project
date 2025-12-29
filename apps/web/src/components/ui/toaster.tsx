import * as React from "react"

export function Toaster() {
  return <div id="toaster" />
}

export function toast(message: string) {
  console.log('Toast:', message)
}
