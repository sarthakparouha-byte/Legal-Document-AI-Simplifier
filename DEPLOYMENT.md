# Deployment Guide for Free Hosting

This guide provides options for deploying the Legal Document Analyzer application (React frontend + FastAPI backend) using free hosting services.

## Prerequisites
- GitHub account (for most deployment options)
- MongoDB Atlas account (for database hosting)

## Database Setup (MongoDB Atlas - Free)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
5. Whitelist your IP (or 0.0.0.0/0 for testing)

## Frontend Deployment Options

### Option 1: Vercel (Recommended)
1. Sign up at [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Vercel will auto-detect React app
4. Set build command: `npm run build`
5. Deploy automatically on push

**Pros:** Fast, reliable, free custom domain
**Cons:** Static only (no server-side rendering)

### Option 2: Netlify
1. Sign up at [Netlify](https://netlify.com)
2. Connect GitHub repo
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Deploy

**Pros:** Great for static sites, form handling
**Cons:** Limited backend capabilities

### Option 3: GitHub Pages
1. Push code to GitHub
2. Go to repository Settings > Pages
3. Select source branch and folder
4. Use GitHub Actions for build/deploy

**Pros:** Completely free, integrated with Git
**Cons:** No custom domains without paid plan

## Backend Deployment Options

### Option 1: Render (Recommended)
1. Sign up at [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set build/runtime settings:
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `MONGO_URL`: Your MongoDB connection string
   - `GEMINI_API_KEY`: Your API key
   - `DB_NAME`: Your database name

**Pros:** Free tier, persistent free plan, easy scaling
**Cons:** Sleeps after 15min inactivity

### Option 2: Railway
1. Sign up at [Railway](https://railway.app)
2. Connect GitHub repo
3. Railway auto-detects Python
4. Set start command: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

**Pros:** Modern, fast deployment
**Cons:** Limited free hours

### Option 3: Fly.io
1. Install Fly CLI
2. Run `fly launch` in project root
3. Configure for Python/FastAPI
4. Deploy

**Pros:** Global CDN, good performance
**Cons:** Steeper learning curve

## Full-Stack Deployment (Single Platform)

### Option 1: Vercel + Render (Recommended)
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

### Option 2: Single Platform Deployment (Both Frontend & Backend Together)

#### Railway Deployment (Single Platform - Recommended)

Railway can deploy your entire Legal Document Analyzer application from a single repository.

### Step-by-Step Railway Deployment:

1. **Sign up at Railway**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub (recommended for easy repo connection)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository containing the Legal Document Analyzer code

3. **Automatic Detection**
   - Railway will automatically detect your project structure
   - It will identify the React frontend in the `frontend/` directory
   - It will identify the Python FastAPI backend in the `backend/` directory

4. **Configure Environment Variables**
   - In your Railway project dashboard, go to "Variables"
   - Add these environment variables:
     ```
     GEMINI_API_KEY=AlzaSyCeV5fPOp8pv49YO-id2HJJP-xLc0UV4rs
     MONGO_URL=your_mongodb_atlas_connection_string
     DB_NAME=legal_docs
     ```
   - Replace `your_mongodb_atlas_connection_string` with your actual MongoDB Atlas URL

5. **Deploy**
   - Railway will automatically start building and deploying
   - The build process will:
     - Install Python dependencies from `backend/requirements.txt`
     - Install Node.js dependencies from `frontend/package.json`
     - Build the React frontend
     - Start the FastAPI backend
   - Deployment usually takes 5-10 minutes

6. **Get Your Live URL**
   - Once deployed, Railway will provide a live URL (e.g., `https://legal-docs-production.up.railway.app`)
   - Your frontend and backend will be accessible at this single URL

### Railway-Specific Configuration

If Railway doesn't auto-detect correctly, you can add a `railway.json` file to your project root:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn backend.server:app --host 0.0.0.0 --port $PORT"
  }
}
```

### Railway Free Tier Limits
- 512MB RAM
- 1GB disk space
- $5 monthly usage credit
- Sleeps after 30 minutes of inactivity

### Troubleshooting Railway Deployment
- **Build fails:** Check Railway logs for missing dependencies
- **Environment variables:** Ensure all required vars are set
- **MongoDB connection:** Verify your Atlas connection string and IP whitelist
- **Port issues:** Railway uses `$PORT` environment variable automatically

### Scaling on Railway
- Add more RAM/CPU in project settings
- Use Railway's database services instead of MongoDB Atlas (paid)
- Set up multiple environments (staging/production)

#### Render (Alternative Single Platform)
You can deploy both to Render using a single service:

1. Modify your backend to serve static files:
   - Add static file serving to your FastAPI app
   - Build the React app during deployment

2. Update your `backend/server.py`:
```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# After your API routes
app.mount("/static", StaticFiles(directory="../frontend/build/static"), name="static")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if full_path.startswith("api/"):
        return {"error": "API route not found"}
    file_path = os.path.join("../frontend/build", full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse("../frontend/build/index.html")
```

3. Update build command in Render:
   - Build Command: `cd frontend && npm install && npm run build && cd .. && pip install -r requirements.txt`
   - Start Command: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`

**Pros:** Single service, unified deployment
**Cons:** More complex configuration

#### Fly.io (Advanced Single Platform)
Fly.io can run your full application in a single Docker container:

1. Create a `Dockerfile` in your project root:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install Node.js for building frontend
RUN apt-get update && apt-get install -y nodejs npm

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend and build
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# Expose port
EXPOSE 8000

# Start command
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. Deploy to Fly.io following their Python deployment guide

**Pros:** Complete control, single container
**Cons:** Requires Docker knowledge

#### Step-by-Step Deployment Guide:

**1. Database Setup (MongoDB Atlas)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign up
2. Create a free cluster (AWS, Google Cloud, or Azure)
3. Create a database user with read/write permissions
4. Get your connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Whitelist your IP (or 0.0.0.0/0 for testing)
6. Create a database named `legal_docs`

**2. Backend Deployment (Render)**
1. Sign up at [Render](https://render.com)
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name:** legal-docs-backend
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `GEMINI_API_KEY`: AlzaSyCeV5fPOp8pv49YO-id2HJJP-xLc0UV4rs
   - `MONGO_URL`: Your MongoDB connection string
   - `DB_NAME`: legal_docs
6. Click "Create Web Service"
7. Wait for deployment (may take 5-10 minutes)
8. Note your backend URL (e.g., https://legal-docs-backend.onrender.com)

**3. Frontend Deployment (Vercel)**
1. Sign up at [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset:** Create React App
   - **Root Directory:** frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** build
5. Add Environment Variable:
   - `REACT_APP_API_URL`: Your Render backend URL (e.g., https://legal-docs-backend.onrender.com/api)
6. Click "Deploy"
7. Wait for deployment (usually 2-3 minutes)
8. Your site will be live at a Vercel domain (e.g., https://legal-docs-frontend.vercel.app)

**4. Update Backend CORS (Optional but Recommended)**
In your backend/server.py, update the CORS origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-domain.vercel.app"],  # Replace with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
Then redeploy the backend on Render.

**5. Test Your Deployment**
- Visit your Vercel frontend URL
- Try uploading a document
- Test the chat functionality
- Check that data persists in MongoDB

### Option 2: Netlify + Railway
- Frontend: Netlify
- Backend: Railway
- Database: MongoDB Atlas

## Environment Variables Required
For backend deployment, set these environment variables:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `MONGO_URL`: MongoDB Atlas connection string
- `DB_NAME`: Database name (default: legal_docs)

## CORS Configuration
Update CORS origins in backend/server.py to include your frontend URL:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Add your deployed frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Post-Deployment Checklist
- [ ] Test frontend loads correctly
- [ ] Test document upload functionality
- [ ] Test chat feature
- [ ] Verify database connections
- [ ] Check API endpoints work
- [ ] Test on mobile devices

## Cost Comparison (Free Tiers)
- **Vercel:** 100GB bandwidth/month, unlimited static sites
- **Render:** 750 hours/month, 1GB RAM
- **Railway:** $5/month credit, then pay-per-use
- **MongoDB Atlas:** 512MB storage, shared clusters
- **Netlify:** 100GB bandwidth/month
- **Fly.io:** 3 shared CPUs, 256MB RAM

## Troubleshooting
- **CORS errors:** Update allowed origins in backend
- **Environment variables:** Ensure all required vars are set
- **Build failures:** Check logs for missing dependencies
- **Database connection:** Verify MongoDB whitelist and connection string
