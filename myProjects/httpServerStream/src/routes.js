import CreateUserController from "./controllers/CreateUserController.js";
import LoginUserController from "./controllers/LoginUserController.js";
import GetUsersController from "./controllers/GetUsersController.js";
import GetUserController from "./controllers/GetUserController.js";
import DeleteUserController from "./controllers/DeleteUserController.js";
import UpdateUserController from "./controllers/UpdateUserController.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

export const routes = {
  "post:/user": CreateUserController.create,
  "post:/login": LoginUserController.login,
  "get:/users": authMiddleware(GetUsersController.index),
  "get:/user/[id]": authMiddleware(GetUserController.show),
  "delete:/user/[id]": authMiddleware(DeleteUserController.delete),
  "put:/user/[id]": authMiddleware(UpdateUserController.update),
  404: (req, res) => {
    res.writeHead(404);
    res.write("Not found.");
    res.end();
  },
};
