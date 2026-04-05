import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Usage: npm run user:set-password -- <email> <new-password>');
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('Password must be at least 8 characters long.');
    process.exit(1);
  }

  await connectDatabase();

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.error(`User not found: ${email}`);
      process.exitCode = 1;
      return;
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log(`Password updated successfully for ${email}`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (error) => {
  console.error('Failed to set user password:', error);
  await disconnectDatabase();
  process.exit(1);
});
