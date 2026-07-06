import localFont from 'next/font/local'

export const mono = localFont({
  src: [
    { path: '../public/fonts/403Mono-Light.otf', weight: '300', style: 'normal' },
    { path: '../public/fonts/403Mono-Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/403Mono-Medium.otf', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

export const grotesk = localFont({
  src: [
    { path: '../public/fonts/NHG-Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/NHG-Medium.otf', weight: '500', style: 'normal' },
    { path: '../public/fonts/NHG-Bold.otf', weight: '700', style: 'normal' },
    { path: '../public/fonts/NHG-ExtraBold.otf', weight: '800', style: 'normal' },
  ],
  variable: '--font-grotesk',
  display: 'swap',
})