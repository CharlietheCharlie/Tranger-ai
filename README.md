Tranger — 支援AI生成行程的即時多人協作旅遊規劃系統

使用 Next.js、ChatGPT、Prisma、PostgreSQL、Socket.IO 打造的全端協作旅遊規劃平台，支援多人共同編輯行程、即時聊天、圖片上傳與邀請分享。

功能總覽:

Google 登入（NextAuth）

AI 生成行程

即時聊天室（Socket.IO）

行程拖曳編輯（dnd-kit）

邀請連結加入共同編輯

聊天圖片上傳

React Query 樂觀更新

多語系支援（英 / 繁 / 日）

全裝置 RWD 自適應

PostgreSQL + Prisma

Vercel + Railway 雲端部署

系統架構說明:

Next.js API：負責資料存取

Socket Server：負責廣播

狀態同步：使用 React Query


聊天圖片上傳限制:

只允許：JPG / PNG / GIF / WEBP

最大 5MB

Tranger — Real-Time Collaborative Travel Planner

A full-stack real-time collaborative travel planning application with AI-generated trip planning, drag-and-drop itinerary management, real-time chat, image upload, and secure invite links. built with Next.js, Prisma, PostgreSQL, and Socket.IO.
It allows users to create itineraries, manage daily activities with drag-and-drop, chat in real time, invite collaborators via secure links, and upload images to comments.

This project focuses on:

Real-time collaboration

Modern frontend architecture

Scalable backend design

Production-grade auth & file upload

🚀 Live Features

✅ AI-generated trip planning

✅ Manual drag & drop itinerary editing

✅ Real-time chat with image upload

✅ Invite collaborators via token links

✅ Google OAuth login

✅ Optimistic UI updates

✅ Multi-language support

✅ Mobile-first responsive UI

✅ PostgreSQL + Prisma ORM

✅ Vercel + Railway deployment

 Tech Stack
Frontend

Next.js (App Router)

TypeScript

Tailwind CSS

Framer Motion

React Query

NextAuth

dnd-kit

next-intl (i18n)

Backend

Express (Socket Server)

Socket.IO

Prisma ORM

PostgreSQL

AWS S3 Compatible Storage

Infrastructure

Frontend: Vercel

Backend (WebSocket): Railway

Database: Railway PostgreSQL
