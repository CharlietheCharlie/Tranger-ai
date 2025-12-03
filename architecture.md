
# Tranger AI - Hybrid Vercel & AWS Architecture

This architecture is optimized for a "Side Project" budget while maintaining scalability. It leverages Vercel for the frontend/SSR and AWS for stateful serverless compute.

```mermaid
graph TD
    subgraph "Client Side"
        Browser[User Browser]
    end

    subgraph "Vercel Platform (Free/Pro Tier)"
        Edge[Vercel Edge Network]
        NextServer[Next.js 15 Server]
        RouteHandlers[Route Handlers\n(api/ai, api/auth)]
        Static[Static Assets]
    end

    subgraph "AWS Cloud (Serverless)"
        APIG[API Gateway\n(WebSocket & REST)]
        
        subgraph "Compute Layer"
            Lambda_CRUD[Lambda: CRUD Itinerary]
            Lambda_Socket[Lambda: Realtime Sync]
        end

        subgraph "Data Layer"
            Aurora[Aurora Serverless v2\n(PostgreSQL)]
        end
    end

    subgraph "External"
        Gemini[Google Gemini API]
    end

    %% Access Flows
    Browser -->|HTTPS / Next.js Pages| Edge
    Edge --> Static
    Edge --> NextServer

    %% AI Flow (Secure Server-side call)
    NextServer -->|/api/ai| RouteHandlers
    RouteHandlers -->|API Key| Gemini

    %% Data & Realtime Flow (Direct from Client)
    Browser -->|REST API (Save/Load)| APIG
    Browser -->|WebSocket (Collab)| APIG

    %% Backend Logic
    APIG -->|POST /itinerary| Lambda_CRUD
    APIG -->|$connect / onmessage| Lambda_Socket

    %% Database
    Lambda_CRUD --> Aurora
    Lambda_Socket --> Aurora
```

## Key Changes for Cost Efficiency
1.  **Hosting**: Moved from S3/CloudFront to **Vercel**. Vercel handles SSL, CDNs, and build pipelines automatically (Zero config, Free tier).
2.  **AI Logic**: Moved Gemini calls to **Next.js Route Handlers**. This keeps your API keys secure on Vercel's backend without needing a separate AWS Lambda for simple AI text generation.
3.  **Realtime**: Kept **AWS API Gateway + Lambda** for WebSockets. This is the most robust serverless way to handle connections without paying for a 24/7 EC2 server.
4.  **Database**: **Aurora Serverless v2** scales down when not in use (though keep an eye on ACU minimums).
