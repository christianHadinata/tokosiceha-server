-- User bisa member / admin
CREATE TABLE Users (
  user_id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL, 
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL DEFAULT 'member',
  user_phone VARCHAR(50) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

--Kecamatan
CREATE TABLE Districts (
  district_id SERIAL PRIMARY KEY,
  district_name VARCHAR(255) NOT NULL
);

--Kelurahan
CREATE TABLE Subdistricts (
  subdistrict_id SERIAL PRIMARY KEY,
  subdistrict_name VARCHAR(255) NOT NULL,
  district_id INT REFERENCES Districts(district_id) NOT NULL
);

-- Alamat user
CREATE TABLE Addresses (
  address_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES USERS(user_id) NOT NULL,
  address_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  subdistrict_id INT REFERENCES Subdistricts(subdistrict_id) NOT NULL --Kelurahan
);

-- Kategori produk
CREATE TABLE Categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Produk
-- product_featured_image_url itu gambar utama nya, yang kalau di tokped muncul di card
CREATE TABLE Products (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL CHECK (product_price >= 0),
  product_stock INT DEFAULT 0,
  product_details TEXT,
  product_featured_image_url VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  category_id INT REFERENCES Categories(category_id) NOT NULL
);

-- Keterangan tabel Product_Snapshots:
-- Jadi setiap bikin atau update tabel Products, bakal ngebikin juga tabel ini
-- tujuan nya jadi snapshot, jadi nanti history pesanan tinggal cari kaya Product_Snapshots yang created_at nya sebelum created_at Orders tapi paling baru
CREATE TABLE Product_Snapshots (
  product_snapshot_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES Products(product_id) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  product_stock INT DEFAULT 0,
  product_details TEXT,
  product_featured_image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  category_id INT REFERENCES Categories(category_id) NOT NULL
);

-- Foto produk yang lain
-- ada created_at buat nanti jadi snapshot juga
-- jadi logic nya pas liat history pesanan, nah kalau liat foto itu ambil nya Product_Images yang created_at nya sebelum created_at Orders tapi paling baru
CREATE TABLE Product_Images (
  product_image_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES Products(product_id) NOT NULL,
  product_image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- buat 1 product pada cart
CREATE TABLE Cart_Items (
  cart_item_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES Products(product_id) NOT NULL,
  user_id INT REFERENCES Users(user_id) NOT NULL,
  product_quantity INT NOT NULL DEFAULT 1
);

-- kaya bank, e money, dll
CREATE TABLE Payment_Categories (
  payment_category_id SERIAL PRIMARY KEY,
  payment_category_name VARCHAR(255) NOT NULL
);

-- kaya BCA, gopay, dll
CREATE TABLE Payment_Providers (
  payment_provider_id SERIAL PRIMARY KEY,
  payment_provider_name VARCHAR(255) NOT NULL,
  payment_category_id INT REFERENCES Payment_Categories(payment_category_id) NOT NULL
);

-- Pembayaran
CREATE TABLE Payments (
  payment_id SERIAL PRIMARY KEY,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_provider_id INT REFERENCES Payment_Providers(payment_provider_id) NOT NULL
);

-- layanan ekspedisi, kaya jne, sicepat, dll
CREATE TABLE Shipment_Providers (
  shipment_provider_id SERIAL PRIMARY KEY,
  shipment_provider_name VARCHAR(255) NOT NULL
);

-- pengiriman
-- shipment_status itu kaya belum dikirim, dalam perjalanan, sampai pada tujuan, dll
CREATE TABLE Shipments (
  shipment_id SERIAL PRIMARY KEY,
  address_id INT REFERENCES Addresses(address_id) NOT NULL,
  shipment_status VARCHAR(255) NOT NULL,
  shipment_estimation_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  shipment_provider_id INT REFERENCES Shipment_Providers(shipment_provider_id) NOT NULL
);

-- 1 Order bisa banyak Order Items
CREATE TABLE Orders (
  order_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES Users(user_id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  order_status VARCHAR(255) NOT NULL,
  shipment_id INT REFERENCES Shipments(shipment_id),
  payment_id INT REFERENCES Payments(payment_id)
);

-- Keterangan tabel Order_Items:
-- ini tabel buat produk" pada order
-- pas bikin -> nanti dari cart_items di copy product_id sama product_quantity nya, tujuan nya biar cart nya bisa dihapus aja kalau udah ga kepake. Terus ambil product_snapshot_id yang product_id nya sesuai dan created_at nya terbaru
-- harga dll ambil dari product_snapshot_id
CREATE TABLE Order_Items (
  order_item_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES Products(product_id) NOT NULL,
  product_snapshot_id INT REFERENCES Product_Snapshots(product_snapshot_id) NOT NULL,
  product_quantity INT NOT NULL,
  order_id INT REFERENCES Orders(order_id) NOT NULL
);

-- buat review user atas produk itu, ada bintang 1-5, sama deskripsinya biasa
CREATE TABLE Reviews (
  review_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES Products(product_id) NOT NULL,
  user_id INT REFERENCES Users(user_id) NOT NULL,
  order_id INT REFERENCES Orders(order_id) NOT NULL,
  review_stars INT NOT NULL CHECK (review_stars BETWEEN 1 AND 5),
  review_description TEXT NOT NULL
);


-- Constraint dan Trigger buat ketika nambah product atau update product
-- yang buat nambahin product_snapshot otomatis

CREATE OR REPLACE FUNCTION insert_product_snapshot_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO Product_Snapshots (
    product_id, 
    product_name, 
    product_price, 
    product_stock, 
    product_details, 
    product_featured_image_url, 
    created_at, 
    category_id
  )
  VALUES (
    NEW.product_id, 
    NEW.product_name, 
    NEW.product_price, 
    NEW.product_stock, 
    NEW.product_details, 
    NEW.product_featured_image_url, 
    CURRENT_TIMESTAMP, 
    NEW.category_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_snapshot_insert_trigger
AFTER INSERT ON Products
FOR EACH ROW
EXECUTE FUNCTION insert_product_snapshot_on_insert();


-- significant change, maksudnya adalah kalau stock doang yg berubah ya ga bikin snapshot
CREATE OR REPLACE FUNCTION insert_product_snapshot_on_significant_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.product_name IS DISTINCT FROM NEW.product_name OR
      OLD.product_price IS DISTINCT FROM NEW.product_price OR
      OLD.product_details IS DISTINCT FROM NEW.product_details OR
      OLD.product_featured_image_url IS DISTINCT FROM NEW.product_featured_image_url OR
      OLD.category_id IS DISTINCT FROM NEW.category_id) THEN
    INSERT INTO Product_Snapshots (
      product_id, 
      product_name, 
      product_price, 
      product_stock, 
      product_details, 
      product_featured_image_url, 
      created_at, 
      category_id
    )
    VALUES (
      NEW.product_id, 
      NEW.product_name, 
      NEW.product_price, 
      NEW.product_stock, 
      NEW.product_details, 
      NEW.product_featured_image_url, 
      CURRENT_TIMESTAMP, 
      NEW.category_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_snapshot_trigger
AFTER UPDATE ON Products
FOR EACH ROW
EXECUTE FUNCTION insert_product_snapshot_on_significant_change();
