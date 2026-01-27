"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);
// Security middleware - allow swagger UI assets
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
}));
// CORS
app.use((0, cors_1.default)(config_1.corsOptions));
// Request logging
if (config_1.env.isDev) {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Cookie parsing
app.use((0, cookie_parser_1.default)());
// Compression
app.use((0, compression_1.default)());
// Rate limiting
app.use('/api', middleware_1.apiLimiter);
// Swagger documentation
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(config_1.swaggerSpec, {
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6 }
  `,
    customSiteTitle: 'Attractions Network API Docs',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
    },
}));
// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(config_1.swaggerSpec);
});
// API routes
app.use('/api', routes_1.default);
// 404 handler
app.use(middleware_1.notFoundHandler);
// Error handler
app.use(middleware_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await (0, config_1.connectDatabase)();
        // Start listening
        app.listen(config_1.env.port, () => {
            console.log(`
🚀 Server started successfully!
📡 Environment: ${config_1.env.nodeEnv}
🌐 URL: http://localhost:${config_1.env.port}
📚 API: http://localhost:${config_1.env.port}/api
📖 Swagger: http://localhost:${config_1.env.port}/api/docs
❤️  Health: http://localhost:${config_1.env.port}/api/health
      `);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map