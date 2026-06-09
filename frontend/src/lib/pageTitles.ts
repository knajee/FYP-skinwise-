export function getPageTitle(pathname: string): string {
  // Exact matches
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/check-in') return 'New Check-In';
  if (pathname === '/check-in/result') return 'Your Results';
  if (pathname === '/ingredients') return 'Ingredients';
  if (pathname === '/profile') return 'Profile';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/questionnaire') return 'Skin Profile';

  // Dynamic routes (e.g. /results/123)
  if (pathname.startsWith('/results/')) return 'Check-In Details';
  if (pathname.startsWith('/profile/skin-type')) return 'Skin Profile';

  // Fallback
  return 'SkinWISE';
}
