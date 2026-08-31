# 🍽️ QRMate | On-Premises Restaurant & Cafe Management System (Egypt Edition)
### نظام إدارة المطاعم والكافيهات الذكي On-Premise (NFC + QR Menu, KDS, POS & Stands)

A **100% local-first, zero-cloud-dependent digital ordering and POS platform** tailored for the Egyptian market (Egyptian Pound `EGP`, native Arabic RTL & English, local Wi-Fi operation, and offline yearly licensing).

---

## 🌟 Key Highlights & Value Proposition

1. **🛡️ 100% On-Premises & Zero Cloud Risk (0% Down Time)**:
   - Operates on the restaurant's local computer / Mini-PC over local Wi-Fi / LAN.
   - If the public internet goes down in the area, customer ordering, KDS tickets, Captain alerts, and Cashier billing continue working without a hitch.
2. **📱 Instant Zero-App NFC & QR Ordering**:
   - Guests scan the QR code on their table or tap their smartphone to the NFC stand/cube to open the digital menu (`http://<local-ip>:3001/?table=5`).
   - Sugar level customizers (سادة / مظبوط / زيادة / مانو), drink sizes, extra toppings, and kitchen notes.
   - Real-time Table Order Progress Counter with celebratory audio chime when the order is marked finished (`Ready ✅ - On the way!`).
3. **🪵 Physical Hardware Product Line (NFC & QR Stands/Cubes)**:
   - **Luxury Laser-Engraved Wooden Cubes**: Solid beech/walnut wood with embedded waterproof NFC chip and laser-etched QR & table number.
   - **Crystal Acrylic L-Stands & Tent Cards**: Sleek double-sided acrylic with UV color printing.
   - **Brushed Metallic Plates**: Stainless steel / brass plates for outdoor lounges and high-end bistros.
4. **🔔 Role-Based Station Dispatch & Live Audio Notifications**:
   - **Captain Screen**: Live alerts for table orders, "Call Waiter" (water, napkins, hookah charcoal / تغيير فحم), and "Request Bill" with preferred payment method.
   - **Kitchen Screen (KDS)**: Dedicated food preparation screen (grills, burgers, pizzas, breakfast).
   - **Barista Screen (KDS)**: Dedicated drinks, specialty coffee, desserts, and hookah screen.
   - **Cashier POS**: Visual table floor plan, 14% Egyptian VAT + 12% Service fee calculations, custom discounts, and bilingual 80mm thermal receipt printing.
5. **🔑 Yearly Offline Cryptographic Licensing**:
   - Hardware-bound cryptographic signature engine using the server PC's unique Machine ID.
   - Allows the distributor to issue 1-year activation keys offline with zero cloud server requirements.

---

## 🚀 Quick Start (Running Locally on Windows)

### 1. Launch the Server
Double-click `scripts\start-system.bat` or run:
```bash
npm start
```
The server will start on `http://localhost:3001` and `http://<your-local-ip>:3001`.

### 2. Access the System Roles
- **Public Showcase & Product Catalogue**: `http://localhost:3001/` (Tab: *Showcase*)
- **Customer Table Menu**: `http://localhost:3001/?table=5` (Tab: *Menu*)
- **Captain / Waiter Alert Screen**: `http://localhost:3001/` (Tab: *Captain*)
- **Kitchen & Barista KDS Screen**: `http://localhost:3001/` (Tab: *KDS*)
- **Cashier POS & Table Billing**: `http://localhost:3001/` (Tab: *POS*)
- **Admin Back-Office & License Studio**: `http://localhost:3001/` (Tab: *Admin*)

---

## 🔑 Issuing & Activating Yearly Licenses

### Generating a License Key for a Client
Run the license generator script:
```bash
node scripts/issue-license.js "مطعم الأصيل - المعادي" "EGY-POS-XXXX-XXXX" 365 50
```
- Or double-click `scripts\issue-license.bat` and follow the on-screen prompts.
- Give the generated key (`LIC-...`) to the restaurant manager.
- In the **Admin Dashboard > License Tab**, paste the key and click **Activate License**.

---

## 🛠️ Technology Stack
- **Backend**: Node.js, Express, WebSockets (`ws`), SQLite (`sql.js` WebAssembly).
- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, `qrcode.react`, `canvas-confetti`.
- **Packaging**: Portable Windows batch launchers & Single Executable ready.
