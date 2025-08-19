import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { storage } from '../storage';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// 登录请求schema
const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "密码不能为空"),
});

// 注册请求schema
const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
  realName: z.string().min(1, "请输入真实姓名"),
  phone: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
});

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // 检查邮箱是否已存在
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // 创建用户
    const newUser = await storage.createUser({
      id: nanoid(),
      email: validatedData.email,
      password: hashedPassword,
      realName: validatedData.realName,
      phone: validatedData.phone,
      organization: validatedData.organization,
      department: validatedData.department,
      position: validatedData.position,
      isActive: true,
    });

    // 生成JWT令牌
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: '注册成功',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: error.errors 
      });
    }
    
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    // 查找用户
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return res.status(401).json({ message: '账户已被禁用，请联系管理员' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      message: '登录成功',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: error.errors 
      });
    }
    
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '用户未认证' });
    }

    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 用户登出
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  // 简单实现：客户端删除令牌即可
  // 复杂实现：可以维护令牌黑名单
  res.json({ message: '登出成功' });
});

export default router;
