import * as userService from "../services/user.js";
import { BadRequestError } from "../errors/BadRequestError.js";

export const register = async (req, res) => {
  try {
    const { user_email, user_password, user_name } = req.body;

    const result = await userService.register({
      user_email,
      user_password,
      user_name,
    });

    return res.status(201).json({ success: true, user_id: result.user_id });
  } catch (error) {
    console.error(error);
    if (error instanceof BadRequestError) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    const token = await userService.login({ user_email, user_password });

    return res.json({ success: true, token });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  return res.json(users);
};

export const getSingleUser = async (req, res) => {
  const { user_id } = req.params;

  const user = await userService.getSingleUser(user_id);

  return res.json(user);
};

export const updateUser = async (req, res) => {
  const { user_id } = req.params;

  // assumption that user_email can't be updated

  const { user_password, user_name, user_phone } = req.body;

  const result = await userService.updateUser({
    user_id,
    user_password,
    user_name,
    user_phone,
  });

  return res.json({ success: true, ...result });
};

export const deleteUser = async (req, res) => {
  const { user_id } = req.params;

  await userService.deleteUser(user_id);

  return res.json({ success: true });
};
