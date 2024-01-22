import { useEffect } from "react";
/**
 * useKeyPress
 * @param {string} key - the name of the key to respond to, compared against event.key
 * @param {function} action - the action to perform on key press
 */
export default function useKeypress(key: string, action: () => void) {
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === key) {
        e.preventDefault();
        action();
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [action, key]);
}
