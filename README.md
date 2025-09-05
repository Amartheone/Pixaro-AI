<div align="center">
  <img src="/public/new-logo1.png" alt="PixaroAI Logo" width="120" />
  <h1>PixaroAI 🎨✨</h1>
  <p><strong>Create Without Limits. A modern, AI-powered image editor built for the web.</strong></p>
  <br/>

| [**➡️ Live Demo**](https://pixaro-ai.vercel.app/) |
| :---: |
| *Experience the deployed application* |

  <br/>

  ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
  ![Convex](https://img.shields.io/badge/Convex-222222?style=for-the-badge&logo=convex&logoColor=white)
  ![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Fabric.js](https://img.shields.io/badge/Fabric.js-282c34?style=for-the-badge&logo=javascript&logoColor=61DAFB)

</div>

---

**PixaroAI** is a full-stack, AI-powered image editing application designed to provide a seamless and powerful user experience. It demonstrates a modern web architecture using Next.js for the frontend, Convex for a real-time backend, Clerk for secure authentication, and ImageKit for advanced AI-driven image transformations.

> **Our mission**: To provide a fast, intuitive, and accessible image editing platform where creativity is enhanced by the power of artificial intelligence.

## 📸 Live Preview

The core of PixaroAI is its intuitive and powerful editor interface, designed for a fluid workflow from start to finish.

![PixaroAI Editor Interface](/public/Preview.png)

---

## ✨ Features Showcase

PixaroAI combines a professional suite of editing tools with powerful AI capabilities, unlocked through a tiered subscription model.

### 🎨 Core Editing Suite
- **Project Dashboard**: A secure, personal space to create, view, and manage all your image projects.
- **Responsive Canvas Editor**: A powerful and fluid editor built with Fabric.js, allowing for direct manipulation of objects on the canvas/_components/canvas.jsx`].
- **Advanced Crop & Resize**: Easily resize the canvas with presets for social media or crop with precision using freeform and aspect-ratio-locked tools/_components/tools/resize.jsx`, `amartheone/pixaro-ai/Pixaro-AI-9452a70edf29375fb8ede393c9269adb105d3b2c/app/(main)/editor/[projectid]/_components/tools/crop.jsx`].
- **Fine-tuned Image Adjustments**: Perfect your images with real-time sliders for brightness, contrast, saturation, hue, and blur/_components/tools/adjust.jsx`].
- **Rich Text Tool**: Add, style, and edit text directly on the canvas with a wide range of fonts, colors, sizes, and formatting options/_components/tools/text.jsx`].
- **Full Undo/Redo History**: Never lose your work with a complete history stack for undoing and redoing actions/_components/editor-topbar.jsx`].

### 🤖 AI-Powered Pro Features
- **AI Background Remover**: Instantly remove the background from any image with a single click, powered by ImageKit's advanced AI/_components/tools/ai-background.jsx`].
- **AI Image Extender**: Expand your canvas in any direction and let generative AI intelligently fill in the new space, seamlessly extending your image/_components/tools/ai-extend.jsx`].
- **AI Quality Enhancement**: Automatically retouch, sharpen, and upscale images to improve their quality and resolution with powerful presets/_components/tools/ai-edit.jsx`].

---

## ⚙️ Architecture & Tech Stack

This project utilizes a modern, serverless architecture to deliver a fast, secure, and scalable application.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) | For a performant, server-rendered React frontend with the App Router. |
| **Backend & Database** | [Convex](https://www.convex.dev/) | Provides a real-time database and serverless functions with zero backend boilerplate. |
| **Authentication** | [Clerk](https://clerk.com/) | Handles user management, authentication, and subscription plans securely. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) | A utility-first CSS framework for rapid and consistent UI development. |
| **Canvas** | [Fabric.js](http://fabricjs.com/) | A powerful library for interactive object manipulation on an HTML canvas. |
| **Image CDN & AI** | [ImageKit](https://imagekit.io/) | Manages image uploads, storage, and powers real-time AI transformations. |

---

## 🚀 Getting Started: Local Development

Follow these steps to set up and run the project on your local machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/pixaro-ai.git](https://github.com/your-username/pixaro-ai.git)
cd pixaro-aiThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
