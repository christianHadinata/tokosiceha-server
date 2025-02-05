import * as cartRepo from "../repository/cart.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";

export const getUserCart = async (user_id) => {
  const queryResult = await cartRepo.getUserCart(user_id);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`cart with use id = ${user_id} is not found`);
  }

  return queryResult.rows;
};

export const insertNewCartItem = async ({ user_id, product_id }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if item already exist in user cart
    const product_quantity = await cartRepo.findUserCartItem(client, {
      user_id,
      product_id,
    });

    let queryResult;

    const product_stock = await cartRepo.getProductStock(client, {
      product_id,
    });

    if (product_stock < 1 || product_quantity + 1 > product_stock) {
      throw new BadRequestError(
        `Excedeed maximum quantity of product stock = ${product_stock}`
      );
    }

    if (product_quantity) {
      // if exist then just increment the quantity
      queryResult = await updateCartItem(client, {
        user_id,
        product_id,
        product_quantity: product_quantity + 1,
      });
    } else {
      queryResult = await cartRepo.insertNewCartItem(client, {
        user_id,
        product_id,
      });
    }

    await client.query("COMMIT");
    return { queryResult, success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateCartItem = async (
  client,
  { user_id, product_id, product_quantity }
) => {
  let isExternalClient = true;

  // if client doesn't exist, make new connection
  // client will be exist from external only if this function called from the services
  // client won't be exist, if this function called from the controller
  if (!client) {
    client = await pool.connect();
    isExternalClient = false;
  }

  try {
    if (!isExternalClient) {
      await client.query("BEGIN");
    }

    let queryResult;

    const product_stock = await cartRepo.getProductStock(client, {
      product_id,
    });

    if (product_quantity > product_stock) {
      throw new BadRequestError(
        `Excedeed maximum quantity of product stock = ${product_stock}`
      );
    }

    if (product_quantity === 0) {
      queryResult = await removeCartItem(client, { user_id, product_id });
    } else {
      queryResult = await cartRepo.updateCartItem(client, {
        user_id,
        product_id,
        product_quantity,
      });
    }

    if (!queryResult) {
      throw new BadRequestError("Product doesn't exist in user cart");
    }

    if (!isExternalClient) {
      await client.query("COMMIT");
    }
    return { queryResult, success: true };
  } catch (error) {
    if (!isExternalClient) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    if (!isExternalClient) {
      client.release();
    }
  }
};

export const removeCartItem = async (client, { user_id, product_id }) => {
  let isExternalClient = true;

  // if client doesn't exist, make new connection
  // client will be exist from external only if this function called from the services
  // client won't be exist, if this function called from the controller
  if (!client) {
    client = await pool.connect();
    isExternalClient = false;
  }

  try {
    if (!isExternalClient) {
      await client.query("BEGIN");
    }

    const queryResult = await cartRepo.removeCartItem(client, {
      user_id,
      product_id,
    });

    if (!isExternalClient) {
      await client.query("COMMIT");
    }

    if (!queryResult) {
      throw new BadRequestError("Product doesn't exist in user cart");
    }
    return { queryResult, success: true };
  } catch (error) {
    if (!isExternalClient) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    if (!isExternalClient) {
      client.release();
    }
  }
};

export const clearCart = async (user_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const queryResult = await cartRepo.clearCart(client, {
      user_id,
    });

    await client.query("COMMIT");

    if (!queryResult) {
      throw new BadRequestError("User cart doesn't exist");
    }
    return { queryResult, success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
