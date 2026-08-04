# FRONTEND
| Kategori               | Teknologi      | Versi (Juli 2026) | Alasan                             |
| ---------------------- | -------------- | ----------------: | ---------------------------------- |
| **Frontend Framework** | Vue            |         **3.6.x** | Stabil, Composition API matang     |
| **Build Tool**         | Vite           |           **8.x** | Build cepat, DX sangat baik        |
| **Language**           | TypeScript     |           **6.x** | Type safety penuh                  |
| **Routing**            | Vue Router     |         **4.6.x** | Router resmi Vue                   |
| **State Management**   | Pinia          |           **3.x** | Store resmi Vue                    |
| **HTTP Client**        | Axios          |        **1.11.x** | Interceptor, upload, timeout       |
| **CSS Framework**      | Tailwind CSS   |           **4.x** | Utility-first, performa tinggi     |
| **Icons**              | Lucide         |       **0.55x.x** | Modern, tree-shaking               |
| **Form Validation**    | VeeValidate    |           **5.x** | Integrasi Vue                      |
| **Schema Validation**  | Zod            |           **4.x** | Shared validation frontend/backend |
| **Canvas**             | HTML5 Canvas   |            Native | Untuk game                         |
| **Touch Input**        | Pointer Events |            Native | Mouse + Touch + Pen                |
| **Animation**          | Motion         |          **12.x** | Pengganti Framer Motion untuk Vue  |
| **Package Manager**    | pnpm           |          **10.x** | Cepat dan hemat disk               |
| **Linting**            | ESLint         |           **9.x** | Standar industri                   |
| **Formatter**          | Prettier       |           **3.x** | Konsisten                          |
| **Unit Test**          | Vitest         |           **4.x** | Cepat                              |
| **E2E Test**           | Playwright     |        **1.56.x** | Cross-browser                      |

---
# BACKEND
| Kategori             | Teknologi                  | Versi (Juli 2026) | Alasan                      |
| -------------------- | -------------------------- | ----------------: | --------------------------- |
| **Runtime**          | Node.js                    |        **24 LTS** | LTS terbaru                 |
| **Language**         | TypeScript                 |           **6.x** | Satu bahasa dengan frontend |
| **Framework**        | Fastify                    |           **5.x** | Sangat cepat dan ringan     |
| **Validation**       | Zod                        |           **4.x** | Shared schema               |
| **Authentication**   | JWT                        |           Terbaru | Standar                     |
| **Password Hash**    | Argon2                     |           Terbaru | Lebih kuat dari bcrypt      |
| **Database Driver**  | pg                         |           **8.x** | Native PostgreSQL           |
| **Configuration**    | dotenv                     |          **17.x** | Environment variable        |
| **Logging**          | Pino                       |          **10.x** | Logging cepat               |
| **Security Headers** | @fastify/helmet            |           Terbaru | Header keamanan             |
| **CORS**             | @fastify/cors              |           Terbaru | Cross-origin                |
| **Multipart Upload** | @fastify/multipart         |           Terbaru | Upload file                 |
| **Cookie**           | @fastify/cookie            |           Terbaru | HttpOnly Cookie             |
| **JWT Plugin**       | @fastify/jwt               |           Terbaru | Integrasi JWT               |
| **Architecture**     | Feature-Based Architecture |                 - | Mudah dikembangkan          |

---
# DATABASE
| Kategori       | Teknologi  |   Versi |
| -------------- | ---------- | ------: |
| Database       | PostgreSQL |  **17** |
| Cloud Database | Neon       | Terbaru |
| Driver         | pg         | **8.x** |
| Administration | DBeaver    | Terbaru |

---
# STORAGE
| Kategori      | Teknologi  |
| ------------- | ---------- |
| Image Storage | Cloudinary |

---
# DEPLOYMENT
| Kategori      | Teknologi  |
| ------------- | ---------- |
| Image Storage | Cloudinary |

---
# SECURITY
| Kategori        | Teknologi          |
| --------------- | ------------------ |
| Authentication  | JWT                |
| Token Storage   | HttpOnly Cookie    |
| Password Hash   | Argon2             |
| SQL Protection  | Prepared Statement |
| Validation      | Zod                |
| HTTPS           | TLS                |
| Security Header | Helmet             |
| CORS            | Fastify CORS       |

---
# API
| Kategori      | Teknologi                |
| ------------- | ------------------------ |
| Architecture  | REST API                 |
| Response      | JSON                     |
| Versioning    | Tanpa Versioning         |
| Documentation | OpenAPI 3.1 + Swagger UI |

---
# DEVELOPMENT
| Kategori        | Teknologi               |
| --------------- | ----------------------- |
| Version Control | Git                     |
| Git Workflow    | Trunk-Based Development |
| IDE             | Visual Studio Code      |
| API Testing     | Bruno                   |
| SQL Client      | DBeaver                 |

---
# ARSITEKTUR
Vue 3
│
├── Vite
├── TypeScript
├── Pinia
├── Vue Router
├── Axios
├── Tailwind CSS
├── Zod
└── VeeValidate
        │
        ▼
 REST API (Fastify)
        │
├── Controller
├── Service
├── Repository
├── Validation (Zod)
├── JWT
└── Pino
        │
        ▼
 PostgreSQL 17
        │
        ▼
 Cloudinary (Image)

 
