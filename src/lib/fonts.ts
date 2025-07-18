import { Orbitron } from 'next/font/google';
import { Inter } from 'next/font/google';
import { Audiowide , Manrope} from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const orbitron = Orbitron({
  subsets: ['latin'],
  weight: '700',
});

export const audiowide = Audiowide({
    subsets: ['latin'],
    weight: '400',
  });

export const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
  });