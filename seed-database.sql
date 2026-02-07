-- ========================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- Sistema de Inventario - Construcción y Oficina
-- ========================================

-- 1. CATEGORÍAS (5)
-- ========================================
INSERT OR IGNORE INTO Category (id, name, description, active, createdAt, updatedAt)
VALUES
('cat-tools', 'Herramientas de Construcción', 'Herramientas manuales y eléctricas para construcción', 1, datetime('now'), datetime('now')),
('cat-materials', 'Materiales de Construcción', 'Materiales básicos para obras y proyectos', 1, datetime('now'), datetime('now')),
('cat-electric', 'Electricidad', 'Materiales y herramientas eléctricas', 1, datetime('now'), datetime('now')),
('cat-plumbing', 'Fontanería', 'Materiales y herramientas de fontanería', 1, datetime('now'), datetime('now')),
('cat-office', 'Material de Oficina', 'Suministros y materiales para oficina', 1, datetime('now'), datetime('now'));

-- 2. UNIDADES DE MEDIDA (5)
-- ========================================
INSERT OR IGNORE INTO Unit (id, name, symbol, description, active, createdAt, updatedAt)
VALUES
('unit-pieza', 'Pieza', 'pza', 'Unidad básica de piezas', 1, datetime('now'), datetime('now')),
('unit-kilo', 'Kilogramo', 'kg', 'Unidad de peso', 1, datetime('now'), datetime('now')),
('unit-metro', 'Metro', 'm', 'Unidad de longitud', 1, datetime('now'), datetime('now')),
('unit-litro', 'Litro', 'L', 'Unidad de volumen', 1, datetime('now'), datetime('now')),
('unit-caja', 'Caja', 'caja', 'Contenedor para múltiples unidades', 1, datetime('now'), datetime('now'));

-- 3. CLIENTES (10)
-- ========================================
INSERT OR IGNORE INTO Customer (id, name, email, phone, address, active, createdAt, updatedAt)
VALUES
('cust-1', 'Constructora ABC SRL', 'contacto@abc.com', '+591 70012345', 'Av. Principal #123, La Paz', 1, datetime('now'), datetime('now')),
('cust-2', 'Ingeniería del Norte', 'ventas@norte.com', '+591 71123456', 'Calle Comercio #456, El Alto', 1, datetime('now'), datetime('now')),
('cust-3', 'Constructor Los Andes', 'info@andes.com', '+591 72234567', 'Av. Panamericana #789, Cochabamba', 1, datetime('now'), datetime('now')),
('cust-4', 'Arquitectura Moderna', 'proyectos@moderna.com', '+591 73345678', 'Calle Sucre #321, Sucre', 1, datetime('now'), datetime('now')),
('cust-5', 'Empresa de Obras Civiles', 'civil@obras.com', '+591 74456789', 'Av. Camacho #654, Santa Cruz', 1, datetime('now'), datetime('now')),
('cust-6', 'Constructor Proyecto', 'proyecto@constructor.com', '+591 75567890', 'Calle Illampu #987, Potosí', 1, datetime('now'), datetime('now')),
('cust-7', 'Inmobiliaria Construye', 'ventas@construye.com', '+591 76678901', 'Av. 6 de Agosto #159, Tarija', 1, datetime('now'), datetime('now')),
('cust-8', 'Materiales del Beni', 'beni@materiales.com', '+591 77789012', 'Calle Principal #753, Trinidad', 1, datetime('now'), datetime('now')),
('cust-9', 'Construcciones Pando', 'pando@construcciones.com', '+591 78890123', 'Calle Bolivar #456, Cobija', 1, datetime('now'), datetime('now')),
('cust-10', 'Obras del Oriente', 'oriente@obras.com', '+591 79901234', 'Av. Libertad #852, Santa Cruz', 1, datetime('now'), datetime('now'));

-- 4. PROVEEDORES (10)
-- ========================================
INSERT OR IGNORE INTO Supplier (id, name, email, phone, address, active, createdAt, updatedAt)
VALUES
('sup-1', 'Distribuidora Nacional de Herramientas', 'ventas@nacional.com', '+591 2123456', 'Zona Industrial, La Paz', 1, datetime('now'), datetime('now')),
('sup-2', 'Materiales Premium SRL', 'contacto@premium.com', '+591 2234567', 'Zona Norte, El Alto', 1, datetime('now'), datetime('now')),
('sup-3', 'Constructor del Valle', 'valle@constructor.com', '+591 2345678', 'Av. Heroes #123, Cochabamba', 1, datetime('now'), datetime('now')),
('sup-4', 'Suministros del Oriente', 'oriente@suministros.com', '+591 2456789', 'Zona Sur, Santa Cruz', 1, datetime('now'), datetime('now')),
('sup-5', 'Electricidad Bolivia', 'electrico@bolivia.com', '+591 2567890', 'Calle Sucre #456, Sucre', 1, datetime('now'), datetime('now')),
('sup-6', 'Fontanería Express', 'plomeria@express.com', '+591 2678901', 'Av. 6 de Agosto #789, Tarija', 1, datetime('now'), datetime('now')),
('sup-7', 'Materiales de Construcción', 'materiales@construccion.com', '+591 2789012', 'Zona Centro, La Paz', 1, datetime('now'), datetime('now')),
('sup-8', 'Herramientas Industriales', 'industrial@herramientas.com', '+591 2890123', 'Parque Industrial, Santa Cruz', 1, datetime('now'), datetime('now')),
('sup-9', 'Oficina del Constructor', 'oficina@constructor.com', '+591 2901234', 'Av. Saavedra #654, La Paz', 1, datetime('now'), datetime('now')),
('sup-10', 'Distribuidora del Beni', 'beni@distribuidora.com', '+591 2012345', 'Calle Principal #321, Trinidad', 1, datetime('now'), datetime('now'));

-- 5. PRODUCTOS (20)
-- ========================================
INSERT OR IGNORE INTO Product (id, name, description, sku, price, stock, categoryId, unitId, active, createdAt, updatedAt)
VALUES
-- Herramientas de Construcción (8 productos)
('prod-1', 'Martillo Profesional', 'Martillo de carpintero con mango de fibra', 'MAR-001', 85.00, 50, 'cat-tools', 'unit-pieza', 1, datetime('now'), datetime('now')),
('prod-2', 'Taladro Eléctrico 18V', 'Taladro percutor inalámbrico', 'TAL-001', 450.00, 25, 'cat-tools', 'unit-pieza', 1, datetime('now'), datetime('now')),
('prod-3', 'Sierra Circular 7-1/4', 'Sierra circular para madera', 'SIE-001', 320.00, 30, 'cat-tools', 'unit-pieza', 1, datetime('now'), datetime('now')),
('prod-4', 'Destornillador Eléctrico', 'Destornillador inalámbrico con juego de puntas', 'DES-001', 180.00, 40, 'cat-tools', 'unit-pieza', 1, datetime('now'), datetime('now')),
('prod-5', 'Llave Inglesa 10', 'Llave inglesa ajustable de 10 pulgadas', 'LLA-001', 65.00, 60, 'cat-tools', 'unit-pieza', 1, datetime('now'), datetime('now')),
('prod-6', 'Nivel de Burbuja', 'Nivel de aluminio 60cm', 'NIV-001', 35.00, 80, 'cat-tools', 'unit-pieza', 1, datetime('now'), datetime('now')),
('prod-7', 'Metro Plegable', 'Metro metálico de 5 metros plegable', 'MET-001', 45.00, 70, 'cat-tools', 'unit-metro', 1, datetime('now'), datetime('now')),
('prod-8', 'Set de Brocas', 'Set de 10 brocas de acero rápido', 'BRO-001', 120.00, 35, 'cat-tools', 'unit-caja', 1, datetime('now'), datetime('now')),

-- Materiales de Construcción (4 productos)
('prod-9', 'Cemento Portland 50kg', 'Saco de cemento tipo Portland', 'CEM-001', 45.00, 200, 'cat-materials', 'unit-caja', 1, datetime('now'), datetime('now')),
('prod-10', 'Ladrillo King Kong 18', 'Ladrillo de 18 agujeros', 'LAD-001', 1.80, 5000, 'cat-materials', 'unit-pieza', 1, datetime('now'), datetime('now')),
('prod-11', 'Arena Fina', 'Arena de construcción fina por saco', 'ARE-001', 25.00, 100, 'cat-materials', 'unit-caja', 1, datetime('now'), datetime('now')),
('prod-12', 'Grava 3/4', 'Grava de construcción por camión', 'GRA-001', 350.00, 20, 'cat-materials', 'unit-metro', 1, datetime('now'), datetime('now')),

-- Electricidad (3 productos)
('prod-13', 'Cable Eléctrico 12AWG', 'Carrete de cable eléctrico 12AWG 100m', 'CAB-001', 280.00, 60, 'cat-electric', 'unit-metro', 1, datetime('now'), datetime('now')),
('prod-14', 'Tomas de Pared', 'Set de 10 tomas dobles con tierra', 'TOM-001', 25.00, 45, 'cat-electric', 'unit-caja', 1, datetime('now'), datetime('now')),
('prod-15', 'Interruptor Termomagnético', 'Interruptor 20A monofásico', 'INT-001', 85.00, 30, 'cat-electric', 'unit-pieza', 1, datetime('now'), datetime('now')),

-- Fontanería (2 productos)
('prod-16', 'Tubo PVC 1/2', 'Tubo PVC de 1/2 pulgada 6 metros', 'TUB-001', 15.00, 150, 'cat-plumbing', 'unit-metro', 1, datetime('now'), datetime('now')),
('prod-17', 'Codo PVC 90°', 'Codo PVC de 90 grados 1/2 pulgada', 'COD-001', 2.50, 200, 'cat-plumbing', 'unit-pieza', 1, datetime('now'), datetime('now')),

-- Material de Oficina (3 productos)
('prod-18', 'Papel A4 500 Hojas', 'Resma de papel tamaño A4', 'PAP-001', 45.00, 80, 'cat-office', 'unit-caja', 1, datetime('now'), datetime('now')),
('prod-19', 'Lapiceros Pack', 'Pack de 12 lapiceros de colores', 'LAP-001', 35.00, 50, 'cat-office', 'unit-caja', 1, datetime('now'), datetime('now')),
('prod-20', 'Calculadora de Escritorio', 'Calculadora básica de escritorio', 'CAL-001', 55.00, 25, 'cat-office', 'unit-pieza', 1, datetime('now'), datetime('now'));

-- ========================================
-- 6. INGRESOS (10)
-- 5 de enero 2026, 5 de febrero 2026
-- ========================================

-- INGRESOS DE ENERO 2026 (5 ingresos)
INSERT OR IGNORE INTO Operation (id, type, reference, date, total, notes, createdAt, updatedAt)
VALUES
('op-in-1', 'INBOUND', 'IN-2026-001', '2026-01-05T10:00:00Z', 4500.00, 'Ingreso de herramientas eléctricas', datetime('now'), datetime('now')),
('op-in-2', 'INBOUND', 'IN-2026-002', '2026-01-12T14:00:00Z', 3200.00, 'Ingreso de materiales de construcción', datetime('now'), datetime('now')),
('op-in-3', 'INBOUND', 'IN-2026-003', '2026-01-18T09:00:00Z', 1850.00, 'Ingreso de cable eléctrico', datetime('now'), datetime('now')),
('op-in-4', 'INBOUND', 'IN-2026-004', '2026-01-22T11:00:00Z', 2750.00, 'Ingreso de materiales de fontanería', datetime('now'), datetime('now')),
('op-in-5', 'INBOUND', 'IN-2026-005', '2026-01-30T15:00:00Z', 1250.00, 'Ingreso de material de oficina', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO InboundReceipt (id, operationId, supplierId)
VALUES
('ib-in-1', 'op-in-1', 'sup-1'),
('ib-in-2', 'op-in-2', 'sup-2'),
('ib-in-3', 'op-in-3', 'sup-4'),
('ib-in-4', 'op-in-4', 'sup-6'),
('ib-in-5', 'op-in-5', 'sup-7');

-- Items de ingresos de enero 2026
INSERT OR IGNORE INTO InboundItem (id, inboundReceiptId, productId, quantity, unitPrice, subtotal)
VALUES
-- Items ingreso 1
('ibi-1-1', 'ib-in-1', 'prod-2', 5, 450.00, 2250.00),
('ibi-1-2', 'ib-in-1', 'prod-3', 5, 320.00, 1600.00),
('ibi-1-3', 'ib-in-1', 'prod-4', 3, 180.00, 540.00),
('ibi-1-4', 'ib-in-1', 'prod-5', 2, 65.00, 130.00),
-- Items ingreso 2
('ibi-2-1', 'ib-in-2', 'prod-9', 20, 45.00, 900.00),
('ibi-2-2', 'ib-in-2', 'prod-10', 500, 1.80, 900.00),
('ibi-2-3', 'ib-in-2', 'prod-11', 40, 25.00, 1000.00),
('ibi-2-4', 'ib-in-2', 'prod-12', 4, 350.00, 1400.00),
-- Items ingreso 3
('ibi-3-1', 'ib-in-3', 'prod-13', 5, 280.00, 1400.00),
('ibi-3-2', 'ib-in-3', 'prod-14', 15, 25.00, 375.00),
('ibi-3-3', 'ib-in-3', 'prod-15', 5, 85.00, 425.00),
-- Items ingreso 4
('ibi-4-1', 'ib-in-4', 'prod-16', 50, 15.00, 750.00),
('ibi-4-2', 'ib-in-4', 'prod-17', 100, 2.50, 250.00),
('ibi-4-3', 'ib-in-4', 'prod-1', 10, 85.00, 850.00),
('ibi-4-4', 'ib-in-4', 'prod-6', 20, 35.00, 700.00),
('ibi-4-5', 'ib-in-4', 'prod-8', 10, 120.00, 1200.00),
-- Items ingreso 5
('ibi-5-1', 'ib-in-5', 'prod-18', 20, 45.00, 900.00),
('ibi-5-2', 'ib-in-5', 'prod-19', 10, 35.00, 350.00);

-- INGRESOS DE FEBRERO 2026 (5 ingresos)
INSERT OR IGNORE INTO Operation (id, type, reference, date, total, notes, createdAt, updatedAt)
VALUES
('op-in-6', 'INBOUND', 'IN-2026-006', '2026-02-03T10:00:00Z', 3800.00, 'Ingreso de herramientas manuales', datetime('now'), datetime('now')),
('op-in-7', 'INBOUND', 'IN-2026-007', '2026-02-10T14:00:00Z', 5200.00, 'Ingreso de ladrillos y cemento', datetime('now'), datetime('now')),
('op-in-8', 'INBOUND', 'IN-2026-008', '2026-02-15T09:00:00Z', 2100.00, 'Ingreso de materiales eléctricos', datetime('now'), datetime('now')),
('op-in-9', 'INBOUND', 'IN-2026-009', '2026-02-20T11:00:00Z', 1650.00, 'Ingreso de accesorios de fontanería', datetime('now'), datetime('now')),
('op-in-10', 'INBOUND', 'IN-2026-010', '2026-02-27T15:00:00Z', 980.00, 'Ingreso de suministros de oficina', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO InboundReceipt (id, operationId, supplierId)
VALUES
('ib-in-6', 'op-in-6', 'sup-1'),
('ib-in-7', 'op-in-7', 'sup-7'),
('ib-in-8', 'op-in-8', 'sup-5'),
('ib-in-9', 'op-in-9', 'sup-6'),
('ib-in-10', 'op-in-10', 'sup-9');

-- Items de ingresos de febrero 2026
INSERT OR IGNORE INTO InboundItem (id, inboundReceiptId, productId, quantity, unitPrice, subtotal)
VALUES
-- Items ingreso 6
('ibi-6-1', 'ib-in-6', 'prod-1', 10, 85.00, 850.00),
('ibi-6-2', 'ib-in-6', 'prod-5', 15, 65.00, 975.00),
('ibi-6-3', 'ib-in-6', 'prod-6', 30, 35.00, 1050.00),
('ibi-6-4', 'ib-in-6', 'prod-7', 25, 45.00, 1125.00),
-- Items ingreso 7
('ibi-7-1', 'ib-in-7', 'prod-9', 50, 45.00, 2250.00),
('ibi-7-2', 'ib-in-7', 'prod-10', 1000, 1.80, 1800.00),
('ibi-7-3', 'ib-in-7', 'prod-11', 30, 25.00, 750.00),
-- Items ingreso 8
('ibi-8-1', 'ib-in-8', 'prod-13', 6, 280.00, 1680.00),
('ibi-8-2', 'ib-in-8', 'prod-14', 10, 25.00, 250.00),
('ibi-8-3', 'ib-in-8', 'prod-15', 10, 85.00, 850.00),
-- Items ingreso 9
('ibi-9-1', 'ib-in-9', 'prod-16', 30, 15.00, 450.00),
('ibi-9-2', 'ib-in-9', 'prod-17', 80, 2.50, 200.00),
('ibi-9-3', 'ib-in-9', 'prod-10', 500, 1.80, 900.00),
-- Items ingreso 10
('ibi-10-1', 'ib-in-10', 'prod-18', 15, 45.00, 675.00),
('ibi-10-2', 'ib-in-10', 'prod-19', 8, 35.00, 280.00),
('ibi-10-3', 'ib-in-10', 'prod-20', 2, 55.00, 110.00),
('ibi-10-4', 'ib-in-10', 'prod-1', 1, 85.00, 85.00);

-- ========================================
-- 7. VENTAS
-- 5 al contado (enero), 5 a crédito (enero), 3 al contado (febrero)
-- ========================================

-- VENTAS AL CONTADO - ENERO 2026 (5 ventas)
INSERT OR IGNORE INTO Operation (id, type, reference, date, total, notes, createdAt, updatedAt)
VALUES
('op-vc-1', 'OUTBOUND', 'V-2026-001', '2026-01-08T10:00:00Z', 2450.00, 'Venta al contado - herramientas', datetime('now'), datetime('now')),
('op-vc-2', 'OUTBOUND', 'V-2026-002', '2026-01-15T14:00:00Z', 1850.00, 'Venta al contado - materiales', datetime('now'), datetime('now')),
('op-vc-3', 'OUTBOUND', 'V-2026-003', '2026-01-20T09:00:00Z', 3200.00, 'Venta al contado - eléctrico', datetime('now'), datetime('now')),
('op-vc-4', 'OUTBOUND', 'V-2026-004', '2026-01-25T11:00:00Z', 1450.00, 'Venta al contado - oficina', datetime('now'), datetime('now')),
('op-vc-5', 'OUTBOUND', 'V-2026-005', '2026-01-30T15:00:00Z', 2750.00, 'Venta al contado - herramientas', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO Sale (id, operationId, customerId)
VALUES
('sale-vc-1', 'op-vc-1', 'cust-1'),
('sale-vc-2', 'op-vc-2', 'cust-2'),
('sale-vc-3', 'op-vc-3', 'cust-3'),
('sale-vc-4', 'op-vc-4', 'cust-4'),
('sale-vc-5', 'op-vc-5', 'cust-5');

INSERT OR IGNORE INTO SaleItem (id, saleId, productId, quantity, unitPrice, subtotal)
VALUES
-- Items venta contado 1
('si-vc-1-1', 'sale-vc-1', 'prod-1', 5, 85.00, 425.00),
('si-vc-1-2', 'sale-vc-1', 'prod-2', 2, 450.00, 900.00),
('si-vc-1-3', 'sale-vc-1', 'prod-4', 4, 180.00, 720.00),
('si-vc-1-4', 'sale-vc-1', 'prod-6', 5, 35.00, 175.00),
('si-vc-1-5', 'sale-vc-1', 'prod-18', 5, 45.00, 225.00),
-- Items venta contado 2
('si-vc-2-1', 'sale-vc-2', 'prod-9', 10, 45.00, 450.00),
('si-vc-2-2', 'sale-vc-2', 'prod-10', 100, 1.80, 180.00),
('si-vc-2-3', 'sale-vc-2', 'prod-11', 20, 25.00, 500.00),
('si-vc-2-4', 'sale-vc-2', 'prod-5', 10, 65.00, 650.00),
('si-vc-2-5', 'sale-vc-2', 'prod-7', 2, 45.00, 90.00),
-- Items venta contado 3
('si-vc-3-1', 'sale-vc-3', 'prod-13', 4, 280.00, 1120.00),
('si-vc-3-2', 'sale-vc-3', 'prod-14', 20, 25.00, 500.00),
('si-vc-3-3', 'sale-vc-3', 'prod-15', 6, 85.00, 510.00),
('si-vc-3-4', 'sale-vc-3', 'prod-16', 4, 15.00, 60.00),
-- Items venta contado 4
('si-vc-4-1', 'sale-vc-4', 'prod-18', 20, 45.00, 900.00),
('si-vc-4-2', 'sale-vc-4', 'prod-19', 10, 35.00, 350.00),
('si-vc-4-3', 'sale-vc-4', 'prod-20', 4, 55.00, 220.00),
-- Items venta contado 5
('si-vc-5-1', 'sale-vc-5', 'prod-1', 8, 85.00, 680.00),
('si-vc-5-2', 'sale-vc-5', 'prod-3', 3, 320.00, 960.00),
('si-vc-5-3', 'sale-vc-5', 'prod-5', 10, 65.00, 650.00),
('si-vc-5-4', 'sale-vc-5', 'prod-8', 4, 120.00, 480.00),
('si-vc-5-5', 'sale-vc-5', 'prod-6', 10, 35.00, 350.00);

-- VENTAS A CRÉDITO - ENERO 2026 (5 ventas)
INSERT OR IGNORE INTO Operation (id, type, reference, date, total, notes, createdAt, updatedAt)
VALUES
('op-vcr-1', 'OUTBOUND', 'V-2026-006', '2026-01-10T10:00:00Z', 5250.00, 'Venta a crédito - herramientas manuales', datetime('now'), datetime('now')),
('op-vcr-2', 'OUTBOUND', 'V-2026-007', '2026-01-18T14:00:00Z', 3850.00, 'Venta a crédito - materiales', datetime('now'), datetime('now')),
('op-vcr-3', 'OUTBOUND', 'V-2026-008', '2026-01-22T09:00:00Z', 6100.00, 'Venta a crédito - eléctrico', datetime('now'), datetime('now')),
('op-vcr-4', 'OUTBOUND', 'V-2026-009', '2026-01-26T11:00:00Z', 2750.00, 'Venta a crédito - herramientas eléctricas', datetime('now'), datetime('now')),
('op-vcr-5', 'OUTBOUND', 'V-2026-010', '2026-01-31T15:00:00Z', 4100.00, 'Venta a crédito - materiales y herramientas', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO Sale (id, operationId, customerId)
VALUES
('sale-vcr-1', 'op-vcr-1', 'cust-6'),
('sale-vcr-2', 'op-vcr-2', 'cust-7'),
('sale-vcr-3', 'op-vcr-3', 'cust-8'),
('sale-vcr-4', 'op-vcr-4', 'cust-9'),
('sale-vcr-5', 'op-vcr-5', 'cust-10');

INSERT OR IGNORE INTO SaleItem (id, saleId, productId, quantity, unitPrice, subtotal)
VALUES
-- Items venta crédito 1
('si-vcr-1-1', 'sale-vcr-1', 'prod-1', 10, 85.00, 850.00),
('si-vcr-1-2', 'sale-vcr-1', 'prod-5', 20, 65.00, 1300.00),
('si-vcr-1-3', 'sale-vcr-1', 'prod-6', 30, 35.00, 1050.00),
('si-vcr-1-4', 'sale-vcr-1', 'prod-7', 20, 45.00, 900.00),
('si-vcr-1-5', 'sale-vcr-1', 'prod-8', 5, 120.00, 600.00),
('si-vcr-1-6', 'sale-vcr-1', 'prod-2', 1, 450.00, 450.00),
-- Items venta crédito 2
('si-vcr-2-1', 'sale-vcr-2', 'prod-9', 15, 45.00, 675.00),
('si-vcr-2-2', 'sale-vcr-2', 'prod-10', 500, 1.80, 900.00),
('si-vcr-2-3', 'sale-vcr-2', 'prod-11', 30, 25.00, 750.00),
('si-vcr-2-4', 'sale-vcr-2', 'prod-12', 3, 350.00, 1050.00),
-- Items venta crédito 3
('si-vcr-3-1', 'sale-vcr-3', 'prod-13', 10, 280.00, 2800.00),
('si-vcr-3-2', 'sale-vcr-3', 'prod-14', 10, 25.00, 250.00),
('si-vcr-3-3', 'sale-vcr-3', 'prod-15', 12, 85.00, 1020.00),
-- Items venta crédito 4
('si-vcr-4-1', 'sale-vcr-4', 'prod-2', 5, 450.00, 2250.00),
('si-vcr-4-2', 'sale-vcr-4', 'prod-3', 1, 320.00, 320.00),
('si-vcr-4-3', 'sale-vcr-4', 'prod-16', 6, 15.00, 90.00),
-- Items venta crédito 5
('si-vcr-5-1', 'sale-vcr-5', 'prod-1', 15, 85.00, 1275.00),
('si-vcr-5-2', 'sale-vcr-5', 'prod-9', 20, 45.00, 900.00),
('si-vcr-5-3', 'sale-vcr-5', 'prod-10', 500, 1.80, 900.00),
('si-vcr-5-4', 'sale-vcr-5', 'prod-4', 8, 180.00, 1440.00),
('si-vcr-5-5', 'sale-vcr-5', 'prod-5', 5, 65.00, 325.00);

-- VENTAS AL CONTADO - FEBRERO 2026 (3 ventas)
INSERT OR IGNORE INTO Operation (id, type, reference, date, total, notes, createdAt, updatedAt)
VALUES
('op-vf-1', 'OUTBOUND', 'V-2026-011', '2026-02-05T10:00:00Z', 1950.00, 'Venta al contado - materiales de oficina', datetime('now'), datetime('now')),
('op-vf-2', 'OUTBOUND', 'V-2026-012', '2026-02-15T14:00:00Z', 2850.00, 'Venta al contado - herramientas', datetime('now'), datetime('now')),
('op-vf-3', 'OUTBOUND', 'V-2026-013', '2026-02-25T09:00:00Z', 3400.00, 'Venta al contado - construcción', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO Sale (id, operationId, customerId)
VALUES
('sale-vf-1', 'op-vf-1', 'cust-1'),
('sale-vf-2', 'op-vf-2', 'cust-2'),
('sale-vf-3', 'op-vf-3', 'cust-3');

INSERT OR IGNORE INTO SaleItem (id, saleId, productId, quantity, unitPrice, subtotal)
VALUES
-- Items venta feb 1
('si-vf-1-1', 'sale-vf-1', 'prod-18', 20, 45.00, 900.00),
('si-vf-1-2', 'sale-vf-1', 'prod-19', 15, 35.00, 525.00),
('si-vf-1-3', 'sale-vf-1', 'prod-20', 10, 55.00, 550.00),
-- Items venta feb 2
('si-vf-2-1', 'sale-vf-2', 'prod-1', 10, 85.00, 850.00),
('si-vf-2-2', 'sale-vf-2', 'prod-2', 2, 450.00, 900.00),
('si-vf-2-3', 'sale-vf-2', 'prod-4', 6, 180.00, 1080.00),
-- Items venta feb 3
('si-vf-3-1', 'sale-vf-3', 'prod-9', 15, 45.00, 675.00),
('si-vf-3-2', 'sale-vf-3', 'prod-10', 1000, 1.80, 1800.00),
('si-vf-3-3', 'sale-vf-3', 'prod-11', 40, 25.00, 1000.00),
('si-vf-3-4', 'sale-vf-3', 'prod-5', 15, 65.00, 975.00);

-- ========================================
-- RESUMEN DE DATOS INSERTADOS
-- ========================================
-- 5 Categorías: Herramientas, Materiales, Electricidad, Fontanería, Oficina
-- 5 Unidades: Pieza, Kilogramo, Metro, Litro, Caja
-- 20 Productos: 8 herramientas, 4 materiales, 3 eléctricos, 2 fontanería, 3 oficina
-- 10 Clientes: Constructoras y empresas de obras civiles
-- 10 Proveedores: Distribuidoras y proveedores de materiales
-- 10 Ingresos: 5 enero 2026, 5 febrero 2026
-- 13 Ventas: 5 contado enero, 5 crédito enero, 3 contado febrero
-- ========================================
