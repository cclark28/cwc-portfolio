import localFont from 'next/font/local'

export const mono = localFont({
  src: [
    {
      path: '../public/fonts/GeistMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    // add variants per original spec
  ],
  variable: '--font-geist-mono',
})

export const grotesk = localFont({
  src: [
    {
      path: '../public/fonts/GeistGrotesk-Regular.woff2',
      weight: '400-700',
      style: 'normal',
    },
  ],
  variable: '--font-geist-grotesk',
})
