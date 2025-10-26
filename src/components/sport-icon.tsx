
import type { SportName } from '@/lib/types';
import { Goal, Droplets, Trophy, Users } from 'lucide-react';

// Using a custom SVG for Basketball as it's not in lucide-react
const BasketballIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2a10 10 0 0 0-3.54 19.48"></path>
    <path d="M22 12a10 10 0 0 0-19.48-3.54"></path>
    <path d="M2 12a10 10 0 0 1 3.54-7.48"></path>
    <path d="M12 22a10 10 0 0 1 7.48-16.46"></path>
  </svg>
);

// Using a custom SVG for Volleyball
const VolleyballIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2c-3.2 0-6.2 1.5-8.2 4" />
      <path d="M22 12c0-3.2-1.5-6.2-4-8.2" />
      <path d="M12 22c3.2 0 6.2-1.5 8.2-4" />
      <path d="M2 12c0 3.2 1.5 6.2 4 8.2" />
    </svg>
);

// Custom SVG for Cricket Bat
const CricketIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m16.33 8.9-3.43 3.43" />
        <path d="M11.93 12.33c-3.32.1-7.22 4-7.22 7.22 0 1.25.75 2.25 1.67 2.25s1.67-1 1.67-2.25S9.33 16 11.5 16s2.5 1.5 2.5 1.5" />
        <path d="M18 6s-2 2-4 4" />
        <path d="m17 11 3-3" />
        <path d="m20.5 7.5-1-1" />
        <path d="m14 17 3-3" />
        <path d="m15 14 1.5 1.5" />
        <path d="m12.5 15.5 1.5 1.5" />
    </svg>
);

const BadmintonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m15 9 4-4" /><path d="m10.32 13.68-.02-.02" /><path d="m14 10-3.5 3.5" /><path d="M15.5 12.5 18 10" />
        <path d="M5 11h6" />
        <path d="m5 19 6-6" />
        <path d="M12.37 8.63 10 11l-2.5 2.5" />
        <path d="m14 2-3 3" />
        <path d="m17 5-3 3" />
        <path d="m11 8 2 2" />
        <path d="M5.05 18.95 2.22 21.78" />
        <path d="M3.64 15.21 2.22 16.63" />
    </svg>
);


const TableTennisIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18.12 15.12c2.2-2.2 2.2-5.8 0-8-2.2-2.2-5.8-2.2-8 0-2.2 2.2-2.2 5.8 0 8 2.2 2.2 5.8 2.2 8 0z" />
        <path d="m19 19-3-3" />
        <path d="M12 12 6.4 6.4" />
    </svg>
);


interface SportIconProps extends React.SVGProps<SVGSVGElement> {
  sport: SportName;
}

export function SportIcon({ sport, className, ...props }: SportIconProps) {
  switch (sport) {
    case 'Football':
      return <Goal className={className} {...props} />;
    case 'Basketball':
      return <BasketballIcon className={className} {...props} />;
    case 'Volleyball':
        return <VolleyballIcon className={className} {...props} />;
    case 'Cricket':
        return <CricketIcon className={className} {...props} />;
    case 'Throwball':
        return <Droplets className={className} {...props} />;
    case 'Badminton':
        return <BadmintonIcon className={className} {...props} />;
    case 'Table Tennis':
        return <TableTennisIcon className={className} {...props} />;
    case 'Kabaddi':
        return <Users className={className} {...props} />;
    default:
      return <Trophy className={className} {...props} />;
  }
}
