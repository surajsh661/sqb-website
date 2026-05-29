Drop founder portrait photos here.

Filenames the Engine component looks for (lowercase, .jpg/.png/.webp all work):

  suraj.jpg      (or suraj.png / suraj.webp)
  shubham.jpg    (or shubham.png / shubham.webp)

The first extension found wins. If the file is missing the circle falls
back to the role + name text — no broken-image icon.

Recommended:
- Square or close-to-square crop
- 800×800 px or higher (the site downscales)
- Subject roughly centered, head in the top 60% of the frame (the circle
  crops the corners, so anything in the corners is invisible)
- Save as JPG for photos (smaller file), PNG only if you need transparency

After you add files, commit and push:

  cd ~/Downloads/sqb-website
  git add public/founders
  git commit -m "Add founder photos"
  git push

Vercel auto-redeploys in ~90 seconds.
