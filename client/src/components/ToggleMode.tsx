import { useEffect, useState } from 'react';

const ToggleMode = () => {
  // Initialize darkMode state based on localStorage or default to true
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    return storedMode ? JSON.parse(storedMode) : true;
  });

  // Update document class and localStorage whenever darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Toggle dark mode state
  const toggleMode = () => setDarkMode((prevMode :any) => !prevMode);

  return (
    <button onClick={toggleMode} aria-label="Toggle Dark Mode">
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default ToggleMode;
