import bcrypt from 'bcrypt';
import app from './app.js';
import sequelize from './config/database.js';
import { User, Ekub } from './models/index.js';
import config from './config/config.js';

const PORT = config.port || 5000;

const ensureDrawSchemaCompatibility = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const tableDescription = await queryInterface.describeTable('draws').catch(() => null);

  if (!tableDescription) {
    return;
  }

  if (!tableDescription.lucky_user_ids) {
    await sequelize.query(
      'ALTER TABLE "draws" ADD COLUMN IF NOT EXISTS "lucky_user_ids" JSONB NOT NULL DEFAULT \'[]\'::jsonb;'
    );
    console.log('✅ Added missing draws.lucky_user_ids column');
  }

  if (!tableDescription.is_active) {
    await sequelize.query(
      'ALTER TABLE "draws" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT TRUE;'
    );
    console.log('✅ Added missing draws.is_active column');
  }
};

const seedDefaultData = async () => {
  const adminEmail = 'admin@ekub.com';
  const userEmail = 'user@ekub.com';

  const [admin] = await User.findOrCreate({
    where: { email: adminEmail },
    defaults: {
      full_name: 'Admin User',
      email: adminEmail,
      phone: '+15550000001',
      password_hash: await bcrypt.hash('admin123', config.bcryptRounds),
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const adminEkub = await Ekub.findOne({ where: { name: 'Digital Ekub' } });
  if (!adminEkub) {
    await Ekub.create({
      name: 'Digital Ekub',
      description: 'Default savings group for Digital Ekub draws',
      contribution_amount: 1000.00,
      status: 'ACTIVE',
      created_by: admin.id,
    });
  }

  await User.findOrCreate({
    where: { email: userEmail },
    defaults: {
      full_name: 'Demo User',
      email: userEmail,
      phone: '+15550000002',
      password_hash: await bcrypt.hash('user123', config.bcryptRounds),
      role: 'USER',
      status: 'ACTIVE',
    },
  });
};

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Keep startup non-destructive. Use migrations for schema changes because
    // Sequelize alter can race on constraint names in shared Neon databases.
    if (config.env === 'development') {
      const syncOptions = process.env.DB_SYNC_ALTER === 'true' ? { alter: true } : {};
      await sequelize.sync(syncOptions);
      console.log(`✅ Database models synced${syncOptions.alter ? ' with alter' : ''}`);
      await ensureDrawSchemaCompatibility();
      await seedDefaultData();
      console.log('✅ Default demo accounts seeded');
    } else {
      await ensureDrawSchemaCompatibility();
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${config.env}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    });

    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        console.warn(`⚠️  Port ${PORT} is already in use. The existing API server is still available.`);
        await sequelize.close();
        process.exit(0);
      }

      console.error('❌ Server error:', error);
      await sequelize.close();
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('✅ Database connection closed');
          console.log('👋 Server shutdown complete');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after timeout
      setTimeout(() => {
        console.error('⚠️  Force shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();