# Demo Deployment

This app can be deployed for demo use at zero cost with:

- `frontend` on `Vercel`
- `backend` on `Render`
- `database` on `MongoDB Atlas M0`

## 1. Push To GitHub

Create a GitHub repository and push this project.

## 2. Create MongoDB Atlas Free Database

Create a free `M0` cluster in MongoDB Atlas and copy the connection string.

Example:

```text
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/patient-crm?retryWrites=true&w=majority
```

## 3. Deploy Backend On Render

Create a new Render Web Service from the GitHub repo.

Use:

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`
- Health check path: `/api/health`

Set these environment variables:

- `MONGODB_URI`
- `FRONTEND_ORIGIN`
- `AUTH_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `CLINIC_NAME`

Example:

```text
FRONTEND_ORIGIN=https://your-frontend-name.vercel.app
CLINIC_NAME=Homeopathy Clinic Demo
```

After deploy, your backend URL will look like:

```text
https://patient-crm-demo-api.onrender.com
```

## 4. Deploy Frontend On Vercel

Create a new Vercel project from the same GitHub repo.

Use:

- Framework preset: `Vite`
- Root directory: `frontend`

Set:

- `VITE_API_BASE_URL=https://patient-crm-demo-api.onrender.com/api`

The included `frontend/vercel.json` rewrite ensures React routes like `/patients` and `/queue` work on refresh.

## 5. Demo Login

Use the same values you set in Render:

- Username: `ADMIN_USERNAME`
- Password: `ADMIN_PASSWORD`

## 6. Important Demo Note

This setup is good for demo and light testing only.

Render free services can sleep after inactivity, so scheduled reminders are not reliable enough for real clinic production usage.
