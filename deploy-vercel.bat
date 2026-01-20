@echo off
echo.
echo 🚀 Deploy to Vercel
echo ==================
echo.

echo [INFO] Adding all changes to git...
"C:\Program Files\Git\bin\git.exe" add .

echo [INFO] Committing changes...
"C:\Program Files\Git\bin\git.exe" commit -m "Fix: Downgrade Capacitor iOS to v6 for consistency and fix lunar calendar month display"

echo [INFO] Pushing to GitHub (will trigger Vercel deployment)...
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo ✅ Deployment triggered!
echo.
echo Check Vercel dashboard for deployment status:
echo https://vercel.com/dashboard
echo.
pause