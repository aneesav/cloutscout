---
name: Deployment port mapping
description: Production run command must bind the local port mapped to external 80 in .replit
---
The production (autoscale) deployment forwards external traffic to the local port that `.replit` maps to `externalPort = 80` (here local 8000). The deploy run command must bind that exact port, or health checks return 500/"required port was never opened" and the promote step fails.

**Why:** First publish failed at promote because uvicorn ran on 5000 while the deployment expected 8000.

**How to apply:** When changing the production run command or ports, check the `[[ports]]` section of `.replit` and bind the local port mapped to external 80.
