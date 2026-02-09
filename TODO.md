# TODO: Update Code for Production Deployment

- [x] Update backend/app/**init**.py: Change CORS to allow only the Vercel URL (https://fraemi-srt-translator.vercel.app)
- [x] Update fetch calls in frontend/src/pages/Dashboardpage.jsx to use VITE_API_BASE_URL
- [x] Update fetch calls in frontend/src/context/AuthContext.jsx to use VITE_API_BASE_URL
- [x] Update fetch calls in frontend/src/components/ProjectWorkspace.jsx to use VITE_API_BASE_URL
- [x] Update fetch calls in frontend/src/components/AdvancedEditor.jsx to use VITE_API_BASE_URL
- [x] Update fetch calls in frontend/src/assest/signup.jsx to use VITE_API_BASE_URL
- [x] Update fetch calls in frontend/src/assest/signin.jsx to use VITE_API_BASE_URL
- [ ] Ensure VITE_API_BASE_URL is set in Vercel to https://fraemi-srt-translator-app.onrender.com/
- [ ] Test local dev and production builds
