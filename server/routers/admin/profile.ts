import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { storage } from '../../storage';
import { AuthRequest } from 'server/middleware/route-auth';

const router = Router();

// 配置multer用于文件上传
const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');

// 确保上传目录存在
const ensureUploadDir = async () => {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `admin-${(req as AuthRequest).user?.id}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 个人信息更新schema
const profileUpdateSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(100, '姓名不能超过100个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  username: z.string().min(3, '用户名至少3个字符').max(50, '用户名不能超过50个字符'),
});

// 密码修改schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string().min(6, '新密码至少6个字符').max(100, '密码不能超过100个字符'),
});

// 获取当前管理员信息
router.get('/', async (req: AuthRequest, res) => {
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

// 更新个人信息
router.put('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '管理员未认证' });
    }

    const validatedData = profileUpdateSchema.parse(req.body);
    
    // 检查用户名是否已被其他管理员使用
    if (validatedData.username !== req.user.username) {
      const existingAdmin = await storage.getAdminUserByUsername(validatedData.username);
      if (existingAdmin && existingAdmin.id !== req.user.id) {
        return res.status(400).json({ message: '用户名已被使用' });
      }
    }

    // 检查邮箱是否已被其他管理员使用
    if (validatedData.email !== req.user.email) {
      const existingAdmin = await storage.getAdminUserByEmail(validatedData.email);
      if (existingAdmin && existingAdmin.id !== req.user.id) {
        return res.status(400).json({ message: '邮箱已被使用' });
      }
    }

    // 更新管理员信息
    const updatedAdmin = await storage.updateAdminUser(req.user.id, {
      name: validatedData.name,
      email: validatedData.email,
      username: validatedData.username,
    });

    // 返回更新后的信息（不包含密码）
    const { password, ...adminUserWithoutPassword } = updatedAdmin;
    res.json({
      message: '个人信息更新成功',
      adminUser: adminUserWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: error.errors 
      });
    }
    
    console.error('更新个人信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 修改密码
router.put('/password', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '管理员未认证' });
    }

    const validatedData = passwordChangeSchema.parse(req.body);
    
    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword, 
      req.user.password
    );
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: '当前密码错误' });
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // 更新密码
    await storage.updateAdminUser(req.user.id, {
      password: hashedNewPassword,
    });

    res.json({ message: '密码修改成功' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: error.errors 
      });
    }
    
    console.error('修改密码错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 上传头像
router.post('/avatar', upload.single('avatar'), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '管理员未认证' });
    }

    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' });
    }

    // 构建头像URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // 更新管理员头像信息
    const updatedAdmin = await storage.updateAdminUser(req.user.id, {
      avatar: avatarUrl,
    });

    // 删除旧头像文件（如果存在且不是默认头像）
    if (req.user.avatar && req.user.avatar.startsWith('/uploads/avatars/')) {
      const oldAvatarPath = path.join(process.cwd(), req.user.avatar);
      try {
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        // 忽略删除旧文件的错误
        console.warn('删除旧头像文件失败:', error);
      }
    }

    // 返回更新后的信息（不包含密码）
    const { password, ...adminUserWithoutPassword } = updatedAdmin;
    res.json({
      message: '头像上传成功',
      adminUser: adminUserWithoutPassword,
      avatarUrl
    });
  } catch (error) {
    // 如果出错，删除已上传的文件
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.warn('删除上传文件失败:', unlinkError);
      }
    }

    console.error('上传头像错误:', error);
    res.status(500).json({ message: '头像上传失败' });
  }
});

export default router;
