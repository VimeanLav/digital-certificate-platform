import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireAuth, signToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

function publicOrg(org: { id: string; name: string; email: string; createdAt: Date }) {
  return { id: org.id, name: org.name, email: org.email, createdAt: org.createdAt };
}

// POST /api/auth/register — create an organiser account
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }
  if (String(password).length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  const existing = await prisma.organization.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }
  const passwordHash = await bcrypt.hash(String(password), 10);
  const org = await prisma.organization.create({
    data: { name, email, passwordHash },
  });
  res.status(201).json({ token: signToken(org.id), organization: publicOrg(org) });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  const org = await prisma.organization.findUnique({ where: { email } });
  if (!org || !(await bcrypt.compare(String(password), org.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  res.json({ token: signToken(org.id), organization: publicOrg(org) });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const org = await prisma.organization.findUnique({ where: { id: req.orgId! } });
  if (!org) {
    res.status(401).json({ error: "Account no longer exists" });
    return;
  }
  res.json({ organization: publicOrg(org) });
});

export default router;
