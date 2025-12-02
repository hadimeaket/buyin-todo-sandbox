import { Request, Response, NextFunction } from "express";
import { userService } from "../services/UserService";
import { CreateUserDto, LoginDto } from "../models/User";
import { generateToken } from "../middleware/auth";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateUserDto = {
      email: req.body.email,
      password: req.body.password,
      provider: "local",
    };

    const user = await userService.createUser(data);
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      },
    });
  } catch (error: any) {
    if (
      error.message === "Valid email is required" ||
      error.message === "Password is required" ||
      error.message === "Password must be at least 8 characters long"
    ) {
      res.status(400).json({ message: error.message });
    } else if (error.message === "User with this email already exists") {
      res.status(409).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const credentials: LoginDto = {
      email: req.body.email,
      password: req.body.password,
    };

    const user = await userService.authenticateUser(credentials);
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      },
    });
  } catch (error: any) {
    if (
      error.message === "Invalid email or password" ||
      error.message.includes("This account uses")
    ) {
      res.status(401).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, providerId, name } = req.body;

    if (!email || !providerId) {
      res.status(400).json({ message: "Missing required OAuth data" });
      return;
    }

    const user = await userService.findOrCreateOAuthUser(
      email,
      "google",
      providerId,
      name
    );
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      },
    });
  } catch (error: any) {
    if (error.message.includes("An account with this email already exists")) {
      res.status(409).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const appleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, providerId, name } = req.body;

    if (!email || !providerId) {
      res.status(400).json({ message: "Missing required OAuth data" });
      return;
    }

    const user = await userService.findOrCreateOAuthUser(
      email,
      "apple",
      providerId,
      name
    );
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      },
    });
  } catch (error: any) {
    if (error.message.includes("An account with this email already exists")) {
      res.status(409).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // @ts-ignore - userId is added by auth middleware
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
    });
  } catch (error) {
    next(error);
  }
};
