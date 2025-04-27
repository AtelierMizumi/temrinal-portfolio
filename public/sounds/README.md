# Sound Effects

This directory contains sound effects for the terminal portfolio:

1. `click.mp3` - Used for UI interactions (buttons, menus, terminal keystrokes)
2. `toggle.mp3` - Used for toggle actions like the wobble effect or terminal options

## Implementation

These sounds are implemented using the `useTerminalSounds` hook in `/src/hooks/useTerminalSounds.ts`. The hook provides a `playSound` function that can be called with a sound type:

```jsx
import { useTerminalSounds } from '@/hooks/useTerminalSounds';

const MyComponent = () => {
  const { playSound } = useTerminalSounds({ enabled: true });
  
  const handleButtonClick = () => {
    playSound('click');
    // Do something...
  };
  
  return <button onClick={handleButtonClick}>Click Me</button>;
};
```

## Adding Your Own Sounds

You should add your own sound files here in MP3 format with names matching those listed above.

For best user experience:
- Keep sound effects short (< 0.5 seconds)
- Use subtle sounds that aren't distracting
- Keep volume levels low as they'll play during interaction (volume is set to 0.2 by default)
- Test in different browsers to ensure compatibility

## Free Sound Resources

- https://freesound.org/
- https://mixkit.co/
- https://www.zapsplat.com/
- https://soundbible.com/
- https://opengameart.org/

## Disabling Sounds

Users can disable sounds by setting the `enabled` property to `false` in the `useTerminalSounds` hook. You might want to add a UI toggle in your terminal settings to allow users to enable/disable sounds.