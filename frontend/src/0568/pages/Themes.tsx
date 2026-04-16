import React, { useState, useEffect } from "react";

const Themes = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className='p-6 max-w-4xl mx-auto w-full dark:text-white'>
      <h1 className='text-3xl font-bold mb-6'>Appearance & Themes</h1>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700'>
          <h2 className='text-xl font-semibold mb-4'>Color Mode</h2>
          <p className='text-gray-500 dark:text-gray-400 mb-6'>
            Choose between light and dark mode for your dashboard experience.
          </p>
          
          <div className='flex items-center gap-4'>
            <button 
              onClick={() => setTheme("light")}
              className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all duration-200 ${theme === "light" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 dark:border-gray-700 dark:text-gray-300"}`}
            >
              <div className="text-2xl mb-1"></div>
              <div className="font-bold">Light</div>
            </button>
            <button 
              onClick={() => setTheme("dark")}
              className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all duration-200 ${theme === "dark" ? "border-blue-500 bg-gray-900 text-white" : "border-gray-200 dark:border-gray-700 dark:text-gray-300"}`}
            >
              <div className="text-2xl mb-1"></div>
              <div className="font-bold">Dark</div>
            </button>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700'>
          <h2 className='text-xl font-semibold mb-4'>Accent Color</h2>
          <p className='text-gray-500 dark:text-gray-400 mb-6'>
            Pick a color to personalize buttons and highlights.
          </p>
          
          <div className='flex gap-3 flex-wrap'>
            {["blue", "purple", "rose", "emerald", "amber"].map((color) => (
              <button 
                key={color}
                className={`w-10 h-10 rounded-full bg-${color}-500 border-4 border-white dark:border-gray-900 shadow-sm active:scale-95 transition-transform`}
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-400">Accent colors (Preview mode)</p>
        </div>
      </div>

      <div className='mt-10 bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-3xl text-white shadow-xl'>
        <div className='md:flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold'>Current Preview</h2>
            <p className='opacity-90'>You are currently using the <span className="font-bold uppercase">{theme}</span> theme.</p>
          </div>
          <button 
            onClick={toggleTheme}
            className='mt-4 md:mt-0 px-8 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-colors'
          >
            Switch to {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Themes;
