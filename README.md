# Geolocation Capture Demo

A small Node.js + browser project that asks for a visitor's geolocation when the page opens and sends it to the backend.

## Run

1. Install dependencies:
   npm install
2. Set MongoDB connection string:
   - PowerShell: `$env:MONGODB_URI="your_mongodb_connection_string"`
   - Example local MongoDB: `mongodb://127.0.0.1:27017/geolocation_capture`
3. Set admin key for protected dashboard:
   - PowerShell: `$env:ADMIN_KEY="your_secret_key"`
4. Start server:
   npm start
5. Open:
   http://localhost:3000

## Notes

- Browser geolocation needs user permission.
- Most browsers require HTTPS for geolocation on deployed environments.
- For local development, `http://localhost` is usually allowed.
- Saved locations are persisted in MongoDB.

## API

- `POST /api/location`: saves one location payload
- `GET /api/locations`: returns all saved locations from MongoDB
- `GET /api/admin/locations`: protected endpoint (requires `X-Admin-Key` header)

## Admin Dashboard

- Open `/admin` on your backend URL, for example `http://localhost:3000/admin`.
- Enter your `ADMIN_KEY` to view saved locations in a table.

## Deploy (Render)

1. Push this folder to a GitHub repository.
2. Go to Render Dashboard and click New + > Blueprint.
3. Connect your GitHub repo and select the repo containing this project.
4. Render will read `render.yaml` and create the service automatically.
5. After deploy, open your live site URL:
    `https://<your-service-name>.onrender.com`

## Where To See Saved Locations

- Open this endpoint in browser:
   `https://<your-service-name>.onrender.com/api/locations`
- When someone opens your site and allows location permission, their coordinates will appear in this endpoint response.
- You can also view records directly in MongoDB Compass or Atlas in database `geolocation_capture`, collection `locations`.

## Netlify Frontend Config

- For local saving to MongoDB, leave [public/config.js](public/config.js) empty and run the Node server with `npm start`.
- Open `http://localhost:3000` and allow location. Records will be inserted into MongoDB.
- If you use Netlify for the frontend, you must still point `public/config.js` to a real backend URL because Netlify cannot write to local files.
