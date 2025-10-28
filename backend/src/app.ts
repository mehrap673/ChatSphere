import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import contactRoutes from './routes/contact.routes';
import messageRoutes from './routes/message.routes';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Root route with HTML landing page
app.get('/', (req: Request, res: Response) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ChatSphere API</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 800px;
          width: 100%;
          padding: 40px;
          animation: fadeIn 0.6s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo {
          font-size: 48px;
          margin-bottom: 10px;
        }

        h1 {
          color: #667eea;
          font-size: 36px;
          margin-bottom: 10px;
        }

        .version {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          margin-top: 10px;
        }

        .status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 20px 0;
          padding: 15px;
          background: #e8f5e9;
          border-radius: 10px;
          border-left: 4px solid #4caf50;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          background: #4caf50;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .endpoints {
          margin-top: 30px;
        }

        .endpoints h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 24px;
          text-align: center;
        }

        .endpoint-list {
          display: grid;
          gap: 15px;
        }

        .endpoint {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }

        .endpoint:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .endpoint-name {
          font-size: 18px;
          font-weight: 600;
        }

        .endpoint-path {
          font-family: 'Courier New', monospace;
          background: rgba(255, 255, 255, 0.2);
          padding: 5px 15px;
          border-radius: 6px;
          font-size: 14px;
        }

        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          color: #666;
          font-size: 14px;
        }

        .footer a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .footer a:hover {
          text-decoration: underline;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }

        .info-card {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }

        .info-card-title {
          color: #667eea;
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 14px;
          text-transform: uppercase;
        }

        .info-card-value {
          color: #333;
          font-size: 18px;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .container {
            padding: 20px;
          }

          h1 {
            font-size: 28px;
          }

          .endpoint {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">💬</div>
          <h1>ChatSphere API</h1>
          <span class="version">v1.0.0</span>
        </div>

        <div class="status">
          <div class="status-dot"></div>
          <span><strong>Status:</strong> Server is running smoothly</span>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <div class="info-card-title">Environment</div>
            <div class="info-card-value">${process.env.NODE_ENV || 'Development'}</div>
          </div>
          <div class="info-card">
            <div class="info-card-title">Uptime</div>
            <div class="info-card-value">${Math.floor(process.uptime())}s</div>
          </div>
          <div class="info-card">
            <div class="info-card-title">Timestamp</div>
            <div class="info-card-value">${new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        <div class="endpoints">
          <h2>🚀 Available Endpoints</h2>
          <div class="endpoint-list">
            <div class="endpoint">
              <span class="endpoint-name">🔐 Authentication</span>
              <span class="endpoint-path">/api/auth</span>
            </div>
            <div class="endpoint">
              <span class="endpoint-name">👤 Users</span>
              <span class="endpoint-path">/api/users</span>
            </div>
            <div class="endpoint">
              <span class="endpoint-name">👥 Contacts</span>
              <span class="endpoint-path">/api/contacts</span>
            </div>
            <div class="endpoint">
              <span class="endpoint-name">💬 Messages</span>
              <span class="endpoint-path">/api/messages</span>
            </div>
            <div class="endpoint">
              <span class="endpoint-name">❤️ Health Check</span>
              <span class="endpoint-path">/health</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Built with ❤️ using Express & TypeScript</p>
          <p style="margin-top: 10px;">
            <a href="/health">Check Health</a> | 
            <a href="/api/auth">Auth API</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    error: 'Route not found',
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
