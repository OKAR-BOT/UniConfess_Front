# Commands & Workflow

## Frontend
- Build: `cd Fronted && npx react-scripts build`
- Dev server: `cd Fronted && npx react-scripts start`
- No lint/typecheck scripts available

## Backend
- Start: `cd back && node src/app.js`
- Verify modules: `cd back && node -e "require('./src/controllers/adminController'); require('./src/controllers/reportController'); require('./src/controllers/userController'); require('./src/models/Report'); require('./src/services/otpMailer'); console.log('OK');"`

## Git
- Branch: `feat/fixes-v2` (created from `feat/improvements-v2`)
- Remote: `git@github.com:OKAR-BOT/UniConfess_Front.git`
- Single commit at end after user approval

## Environment
- DB: SQLite via Sequelize
- No hardcoded emojis in new code
- Image service: `https://core.geozns.com/v1/image/preset?preset=avatar_md` with Bearer API key
- API key: `ffafa7297328766a9ebac0bb7c27a1f6a5c42a7f69ebc03ec4ca2177864a6d09`
- CORS origin: `http://localhost:3000`
- Backend runs on port 4000
- Frontend runs on port 3000 (dev), served by backend (prod)
