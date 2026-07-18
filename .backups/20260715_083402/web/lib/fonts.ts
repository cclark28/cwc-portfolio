import localFont from 'next/font/local'

export const mono = localFont({
  src: [
    { path: '../public/fonts/403Mono-Light.woff2', weight: '300', style: 'normal' },
    { path: '../public/fonts/403Mono-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/403Mono-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

export const grotesk = localFont({
  src: [
    { path: '../public/fonts/NHG-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/NHG-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/NHG-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/NHG-ExtraBold.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-grotesk',
  display: 'swap',
})