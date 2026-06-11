export function ThemeScript(): React.JSX.Element {
  const script = `(function(){try{var k='farmfax-theme';var s=localStorage.getItem(k);var t=s==='dark'||s==='light'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
