import pool from "../db/db.js";

export const getUserCart = async (user_id) => {
  const queryText = `
  SELECT
    c.cart_item_id,
    c.product_id,
    c.user_id,
    c.product_quantity
  FROM
    Cart_Items c
  WHERE
    c.user_id = $1
  `;

  const values = [user_id];

  const queryResult = await pool.query(queryText, values);

  return queryResult;
};

export const findUserCartItem = async (client, { user_id, product_id }) => {
  const queryText = `
  SELECT
    c.product_quantity
  FROM
    Cart_Items c
  WHERE
    c.user_id = $1 AND c.product_id = $2
  `;

  const values = [user_id, product_id];

  const queryResult = await client.query(queryText, values);

  return queryResult.rowCount > 0 ? queryResult.rows[0].product_quantity : null;
};

export const insertNewCartItem = async (client, { user_id, product_id }) => {
  const queryText = `
  INSERT INTO
    Cart_Items (user_id, product_id)
  VALUES
    ($1, $2)
  RETURNING cart_item_id
  `;

  const values = [user_id, product_id];

  const queryResult = await client.query(queryText, values);

  return queryResult.rows[0].cart_item_id;
};

export const getProductStock = async (client, { product_id }) => {
  const queryText = `
  SELECT
    p.product_stock
  FROM
    Products p
  WHERE
    p.product_id = $1
  `;

  const values = [product_id];

  const queryResult = await client.query(queryText, values);

  return queryResult.rows[0].product_stock;
};

export const updateCartItem = async (
  client,
  { user_id, product_id, product_quantity }
) => {
  const queryText = `
  UPDATE
    Cart_Items
  SET
    product_quantity = $1
  WHERE
    user_id = $2 AND product_id = $3
  `;

  const values = [product_quantity, user_id, product_id];

  const queryResult = await client.query(queryText, values);

  return queryResult.rowCount > 0;
};

export const removeCartItem = async (client, { user_id, product_id }) => {
  const queryText = `
  DELETE FROM
    Cart_Items
  WHERE
    user_id = $1 AND product_id = $2
  `;

  const values = [user_id, product_id];

  const queryResult = await client.query(queryText, values);

  return queryResult.rowCount > 0;
};

export const clearCart = async (client, { user_id }) => {
  const queryText = `
  DELETE FROM
    Cart_Items
  WHERE
    user_id = $1
  `;

  const values = [user_id];

  const queryResult = await client.query(queryText, values);

  return queryResult.rowCount > 0;
};
