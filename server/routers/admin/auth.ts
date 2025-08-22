import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { storage } from '../../storage';
import { AuthRequest } from 'server/middleware/route-auth';

const router = Router();

// JWT密钥 - 使用不同的密钥以区分用户和管理员token
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-in-production";

// 管理员登录请求schema
const adminLoginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

// 管理员注册请求schema (用于创建管理员账户)
const adminRegisterSchema = z.object({
  username: z.string().min(3, "用户名至少需要3个字符"),
  password: z.string().min(6, "密码至少需要6个字符"),
  name: z.string().min(1, "请输入姓名"),
  email: z.string().email("请输入有效的邮箱地址"),
});

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const validatedData = adminLoginSchema.parse(req.body);
    
    // 查找管理员用户
    const adminUser = await storage.getAdminUserByUsername(validatedData.username);
    if (!adminUser) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(validatedData.password, adminUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign({ adminUserId: adminUser.id }, JWT_SECRET, { expiresIn: '7d' });

    // 设置HttpOnly cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/admin'
    });

    // 返回管理员信息（不包含密码）
    const { password, ...adminUserWithoutPassword } = adminUser;
    
    res.json({
      message: '登录成功',
      adminUser: adminUserWithoutPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: error.errors 
      });
    }
    
    console.error('管理员登录错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 创建管理员账户 (需要超级管理员权限或初始化时使用)
router.post('/register', async (req, res) => {
  try {
    const validatedData = adminRegisterSchema.parse(req.body);
    
    // 检查用户名是否已存在
    const existingAdminByUsername = await storage.getAdminUserByUsername(validatedData.username);
    if (existingAdminByUsername) {
      return res.status(400).json({ message: '该用户名已被使用' });
    }

    // 检查邮箱是否已存在
    const existingAdminByEmail = await storage.getAdminUserByEmail(validatedData.email);
    if (existingAdminByEmail) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // 创建管理员用户
    const newAdminUser = await storage.createAdminUser({
      id: nanoid(),
      username: validatedData.username,
      password: hashedPassword,
      name: validatedData.name,
      email: validatedData.email,
    });

    // 生成JWT令牌
    const token = jwt.sign({ adminUserId: newAdminUser.id }, JWT_SECRET, { expiresIn: '7d' });

    // 返回管理员信息（不包含密码）
    const { password, ...adminUserWithoutPassword } = newAdminUser;
    
    res.status(201).json({
      message: '管理员账户创建成功',
      adminUser: adminUserWithoutPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: error.errors 
      });
    }
    
    console.error('管理员注册错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取当前管理员信息
router.get('/me', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '管理员未认证' });
    }

    // 返回管理员信息（不包含密码）
    const { password, ...adminUserWithoutPassword } = req.user;
    res.json({ adminUser: adminUserWithoutPassword });
  } catch (error) {
    console.error('获取管理员信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 管理员登出
router.post('/logout', async (req: AuthRequest, res) => {
  // 清除cookie
  res.clearCookie('admin_token', { path: '/admin' });
  res.json({ message: '登出成功' });
});

export default router;
