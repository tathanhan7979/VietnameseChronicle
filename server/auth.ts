import bcrypt from 'bcrypt';
import { db } from '@db';
import { users, type User, type InsertUser } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function registerUser(userData: InsertUser): Promise<AuthResult> {
  try {
    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, userData.username)
    });
    
    if (existingUser) {
      return {
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      };
    }
    
    // Mã hóa mật khẩu trước khi lưu
    const hashedPassword = await hashPassword(userData.password);
    
    // Tạo người dùng mới với mật khẩu đã mã hóa
    const [newUser] = await db.insert(users).values({
      username: userData.username,
      password: hashedPassword,
      isAdmin: userData.isAdmin || false,
      createdAt: new Date()
    }).returning();
    
    return {
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: newUser
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      message: 'Lỗi đăng ký tài khoản'
    };
  }
}

export async function loginUser(username: string, password: string): Promise<AuthResult> {
  try {
    // Tìm người dùng theo username
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user) {
      return {
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      };
    }
    
    // Kiểm tra mật khẩu
    const passwordMatch = await comparePasswords(password, user.password);
    
    if (!passwordMatch) {
      return {
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      };
    }
    
    // Cập nhật thời gian đăng nhập cuối
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));
    
    return {
      success: true,
      message: 'Đăng nhập thành công',
      user
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      message: 'Lỗi đăng nhập'
    };
  }
}

export async function createInitialAdminUser(): Promise<void> {
  try {
    // Kiểm tra xem đã có người dùng admin nào chưa
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.isAdmin, true)
    });
    
    if (!existingAdmin) {
      // Tạo tài khoản admin mặc định
      await registerUser({
        username: 'TaThanhAnGroup',
        password: 'Hihihaha123@',
        isAdmin: true
      });
      console.log('Tài khoản admin mặc định đã được tạo');
    }
  } catch (error) {
    console.error('Error creating initial admin user:', error);
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    // Fake implementation - in a real app, would validate JWT or session token
    // Ở đây chỉ là demo, thực tế sẽ dùng JWT hoặc session
    const [username, _] = Buffer.from(token, 'base64').toString().split(':');
    
    if (!username) return null;
    
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    return user || null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export function generateToken(user: User): string {
  // Fake implementation - in a real app, would generate JWT or session token
  // Ở đây chỉ là demo, thực tế sẽ dùng JWT hoặc session
  return Buffer.from(`${user.username}:${user.id}`).toString('base64');
}
