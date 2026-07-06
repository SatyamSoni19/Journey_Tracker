import { prisma } from './src/config/db.js';
import bcrypt from 'bcrypt';

async function main() {
  const users = await prisma.user.findMany({ select: { email: true } });
  console.log('Existing users:', users);
  
  if (users.length > 0) {
    const email = users[0].email;
    const newPassword = '#Sher123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log(`Password for ${email} updated successfully.`);
  } else {
    const email = 'sher123@gmail.com';
    const newPassword = '#Sher123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.create({
      data: {
        name: 'Sher',
        email,
        password: hashedPassword,
      }
    });
    console.log(`Created user ${email} with the new password.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
