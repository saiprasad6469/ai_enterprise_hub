import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { JwtPayload } from '../middleware/auth';

const SALT_ROUNDS = 12;

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: 'Admin' | 'Employee';
    department?: 'Engineering' | 'Legal' | 'HR' | 'Marketing' | 'Operations' | 'Finance';
  }): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) throw new AppError('An account with this email already exists.', 409);

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role || 'Employee',
      department: data.department || 'Engineering',
      status: 'Active',
      refreshTokens: [],
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    return { user, accessToken, refreshToken };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new AppError('Invalid email or password.', 401);

    if (user.status === 'Inactive') {
      throw new AppError('Account is deactivated. Contact your administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new AppError('Invalid email or password.', 401);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();

    return { user, accessToken, refreshToken };
  },

  async refreshAccessToken(
    oldRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    const user = await User.findById(payload.userId);
    if (!user) throw new AppError('User not found.', 401);

    const tokenIndex = user.refreshTokens.indexOf(oldRefreshToken);
    if (tokenIndex === -1) {
      user.refreshTokens = [];
      await user.save();
      throw new AppError('Refresh token reuse detected. All sessions revoked.', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    user.refreshTokens[tokenIndex] = newRefreshToken;
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  },

  generateAccessToken(user: IUser): string {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as string,
    });
  },

  generateRefreshToken(user: IUser): string {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as string,
    });
  },

  sanitizeUser(user: IUser) {
    const obj = user.toObject();
    return {
      id: obj._id,
      name: obj.name,
      email: obj.email,
      role: obj.role,
      department: obj.department,
      status: obj.status,
      avatar: obj.avatar,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  },
};
