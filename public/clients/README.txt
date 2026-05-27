Drop your client-logo PNG files in this folder.

The "Trusted by Global Brands" marquee on the homepage looks for files
named exactly like this (lowercase, no spaces, .png extension):

  haldiram.png    subway.png      tseries.png     pw.png
  sunstone.png    gfg.png         unacademy.png   vahaflix.png
  wtf.png         appx.png        ayush.png       cac.png
  dcc.png         speakin.png     snf.png         tedx.png

Recommended:
- Transparent background PNG
- Logo centered, with about 10% padding around it
- Roughly 400×200 px (the site will scale them down)
- Light/white logos look best against the dark theme

Any logo file that's missing falls back to the brand name shown as text.

After you add files, commit and push:
  cd ~/Downloads/sqb-website
  git add public/clients
  git commit -m "Add client logos"
  git push

Vercel will redeploy automatically within a minute.
